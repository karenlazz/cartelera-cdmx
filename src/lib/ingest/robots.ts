export async function canFetchUrl(targetUrl: string, userAgent = "CDMXExhibitionsBot") {
  try {
    const url = new URL(targetUrl);
    const robotsUrl = `${url.origin}/robots.txt`;
    const response = await fetch(robotsUrl, {
      headers: { "user-agent": userAgent },
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) return true;
    const text = await response.text();
    return isAllowedByRobots(text, url.pathname, userAgent);
  } catch {
    return false;
  }
}

function isAllowedByRobots(robots: string, path: string, userAgent: string) {
  const lines = robots.split(/\r?\n/);
  let applies = false;

  for (const rawLine of lines) {
    const line = rawLine.split("#")[0]?.trim();
    if (!line) continue;

    const [fieldRaw, ...valueParts] = line.split(":");
    const field = fieldRaw?.trim().toLowerCase();
    const value = valueParts.join(":").trim();

    if (field === "user-agent") {
      applies = value === "*" || value.toLowerCase() === userAgent.toLowerCase();
      continue;
    }

    if (applies && field === "disallow" && value && path.startsWith(value)) return false;
  }

  return true;
}
