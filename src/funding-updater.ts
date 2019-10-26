const GITHUB_KEY = "github";
type FundingContent = {
    github?: string | string[];
} & {
    [index: string]: string | string[]
}
export const hasUserInFunding = (fundingContent: FundingContent, user: string, key: string = GITHUB_KEY) => {
    if (fundingContent[key] === undefined) {
        return false;
    }
    if (Array.isArray(fundingContent[key])) {
        return fundingContent[key].includes(user);
    }
    return fundingContent[key] === user;
};

export const addUserToFunding = (fundingContent: FundingContent, user: string, key: string = GITHUB_KEY) => {
    if (hasUserInFunding(fundingContent, user, key)) {
        return fundingContent;
    } else {
        const cloneContent = { ...fundingContent };
        const fundingContentElement = cloneContent[key];
        if (fundingContentElement === undefined) {
            cloneContent[key] = user;
        } else {
            if (Array.isArray(fundingContentElement)) {
                fundingContentElement.push(user);
            } else {
                cloneContent[key] = [fundingContentElement, user];
            }
        }
        return cloneContent;
    }
};
export const deleteUserToFunding = (fundingContent: FundingContent, user: string, key: string = GITHUB_KEY) => {
    if (!hasUserInFunding(fundingContent, user, key)) {
        return fundingContent;
    } else {
        const cloneContent = { ...fundingContent };
        const fundingContentElement = cloneContent[key];
        if (Array.isArray(fundingContentElement)) {
            // remove
            cloneContent[key] = fundingContentElement.filter(existingUser => {
                return existingUser !== user;
            });
        } else {
            delete cloneContent[key];
        }
        return cloneContent;
    }
};
