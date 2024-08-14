
export type websiteStatus = "blocked" | "unblocked";

export interface Website {
    url: string,
    status: websiteStatus
}
