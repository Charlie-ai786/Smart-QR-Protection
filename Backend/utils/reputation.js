// Use global fetch (built-in in Node 18+)

const API_KEY = process.env.GOOGLE_API_KEY; // 🔴 replace this

async function checkURLReputation(url) {
    try {
        const response = await fetch(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    client: {
                        clientId: "qr-security-app",
                        clientVersion: "1.0",
                    },
                    threatInfo: {
                        threatTypes: [
                            "MALWARE",
                            "SOCIAL_ENGINEERING",
                            "UNWANTED_SOFTWARE",
                            "POTENTIALLY_HARMFUL_APPLICATION",
                        ],
                        platformTypes: ["ANY_PLATFORM"],
                        threatEntryTypes: ["URL"],
                        threatEntries: [{ url }],
                    },
                }),
            }
        );

        const data = await response.json();

        if (data.matches) {
            return {
                is_malicious: true,
                threat_type: data.matches[0].threatType,
            };
        }

        return {
            is_malicious: false,
            threat_type: "none",
        };
    } catch (error) {
        console.error("Reputation API error:", error);
        return {
            is_malicious: false,
            threat_type: "unknown",
        };
    }
}

module.exports = { checkURLReputation };