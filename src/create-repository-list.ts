const githubUrlPatten = /^https:?\/\/github.com\/(.*?)\/(.*?)\/?$/;
const ownerRepoPattern = /^.+\/.+$/;
const ownerRepoBranchPattern = /^(.+)\/(.+)@(.+)$/;
export const createRepositoryList = (text: string): { owner: string, repo: string, branch?: string }[] => {
    return text.split("\n")
        .filter(line => line.length !== 0)
        .filter(line => {
            return githubUrlPatten.test(line) || ownerRepoPattern.test(line) || ownerRepoBranchPattern.test(line);
        })
        .map(line => {
            if (githubUrlPatten.test(line)) {
                const match = line.match(githubUrlPatten);
                if (!match) {
                    return { owner: "", repo: "" };
                }
                return {
                    owner: match[1].trim(),
                    repo: match[2].trim()
                };
            } else if (ownerRepoBranchPattern.test(line)) {
                const match = line.match(ownerRepoBranchPattern);
                if (!match) {
                    return { owner: "", repo: "" };
                }
                return {
                    owner: match[1].trim(),
                    repo: match[2].trim(),
                    branch: match[3].trim()
                };
            } else {
                const [owner, repo] = line.split("/");
                return { owner: owner.trim(), repo: repo.trim() };
            }
        }).filter(item => {
            return item.owner.length !== 0 && item.repo.length !== 0;
        });
};
