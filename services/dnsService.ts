
export async function fetchForSaleRecords(domain: string): Promise<string[] | null> {
  const queryDomain = `_for-sale.${domain}`;
  const url = `https://cloudflare-dns.com/dns-query?name=${queryDomain}&type=TXT`;

  try {
    const response = await fetch(url, {
      headers: {
        'accept': 'application/dns-json',
      },
    });

    if (!response.ok) {
      throw new Error(`DNS query failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.Status !== 0) { // 0 is NOERROR
      // NXDOMAIN is common and means no record found, not an error.
      if (data.Status === 3) { // NXDOMAIN
        return null;
      }
      throw new Error(`DNS query returned error status: ${data.Status}`);
    }

    if (!data.Answer) {
      return null;
    }

    // Extract TXT record data, which is often quoted.
    return data.Answer.map((ans: { data: string }) => {
      let recordData = ans.data;
      if (recordData.startsWith('"') && recordData.endsWith('"')) {
        recordData = recordData.substring(1, recordData.length - 1);
      }
      return recordData;
    });
  } catch (error) {
    console.error('Failed to fetch DNS records:', error);
    throw new Error('Could not connect to the DNS service. Please check your network connection.');
  }
}
