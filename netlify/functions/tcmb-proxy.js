// TCMB Doviz Kuru Proxy
// tcmb.gov.tr XML verisini cekip JSON olarak dondurur

exports.handler = async function (event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
    };

    try {
        const dateParam = event.queryStringParameters && event.queryStringParameters.date;
        let url;

        if (dateParam) {
            // Gecmis tarih: DDMMYYYY formatinda gelir -> YY/YYMMDD.xml
            // ornek: 20022026 -> 202602/20260220.xml
            const day = dateParam.substring(0, 2);
            const month = dateParam.substring(2, 4);
            const year = dateParam.substring(4, 8);
            url = `https://www.tcmb.gov.tr/kurlar/${year}${month}/${day}${month}${year}.xml`;
        } else {
            url = 'https://www.tcmb.gov.tr/kurlar/today.xml';
        }

        const res = await fetch(url);

        if (!res.ok) {
            return {
                statusCode: res.status,
                headers,
                body: JSON.stringify({
                    error: 'TCMB verisi alinamadi',
                    detail: res.status === 404 ? 'Bu tarih icin veri bulunamadi (hafta sonu veya tatil olabilir)' : `HTTP ${res.status}`
                })
            };
        }

        const xml = await res.text();
        const rates = parseXml(xml);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(rates)
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Sunucu hatasi', detail: err.message })
        };
    }
};

function parseXml(xml) {
    // Tarih bilgisi
    const dateMatch = xml.match(/Tarih="(\d{2})\.(\d{2})\.(\d{4})"/);
    let date = null;
    if (dateMatch) {
        date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    }

    const rates = {};
    const currencyRegex = /<Currency\s[^>]*Kod="([^"]+)"[^>]*>[\s\S]*?<Isim>([^<]*)<\/Isim>[\s\S]*?<CurrencyName>([^<]*)<\/CurrencyName>[\s\S]*?<ForexBuying>([^<]*)<\/ForexBuying>[\s\S]*?<ForexSelling>([^<]*)<\/ForexSelling>[\s\S]*?<\/Currency>/g;

    let match;
    while ((match = currencyRegex.exec(xml)) !== null) {
        const code = match[1];
        const nameTr = match[2].trim();
        const nameEn = match[3].trim();
        const buying = parseFloat(match[4]);
        const selling = parseFloat(match[5]);

        if (!isNaN(buying) && !isNaN(selling) && buying > 0) {
            rates[code] = {
                nameTr,
                nameEn,
                buying,
                selling
            };
        }
    }

    // Bazi birimler Unit > 1 olabilir (orn: JPY 100 birim)
    const unitRegex = /<Currency\s[^>]*Kod="([^"]+)"[^>]*>[\s\S]*?<Unit>(\d+)<\/Unit>[\s\S]*?<\/Currency>/g;
    let unitMatch;
    while ((unitMatch = unitRegex.exec(xml)) !== null) {
        const code = unitMatch[1];
        const unit = parseInt(unitMatch[2]);
        if (rates[code] && unit > 1) {
            rates[code].buying = rates[code].buying / unit;
            rates[code].selling = rates[code].selling / unit;
            rates[code].unit = unit;
        }
    }

    return {
        date,
        base: 'TRY',
        source: 'TCMB',
        rates
    };
}
