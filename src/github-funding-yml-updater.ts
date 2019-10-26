import { createGitHubAdaptor, createKoreFile, KoreFileAdaptor } from "korefile";
import { deleteFundingFile, fetchFundingFile, writeFundingFile } from "./funding-api-client";
import { addUserToFunding, deleteUserToFunding, hasUserInFunding } from "./funding-updater";

export interface Repository {
    owner: string;
    repo: string;
    // heads/master
    ref?: string;
    token: string;
}

export interface updateFundingOptions {
    mode: "add" | "delete"
    // add or delete user
    user: string;
    repositoryList: Repository[]
    dryRun: boolean;
    silent: boolean;
    createAdaptor?: (repository: Repository) => KoreFileAdaptor
}

export const updateFunding = async (options: updateFundingOptions) => {
    if (!options.silent) {
        console.info(options.dryRun ? "Mode: DryRun mode" : "Mode: Write mode");
        console.info(`User: ${options.user}`);
    }
    for (const repository of options.repositoryList) {
        const adaptorOptions = {
            owner: repository.owner,
            repo: repository.repo,
            ref: repository.ref || "heads/master",
            token: repository.token
        };
        const repoMark = `${repository.owner}/${repository.repo}`;
        const adaptor = options.createAdaptor
            ? options.createAdaptor(adaptorOptions)
            : createGitHubAdaptor(adaptorOptions);
        const korefile = createKoreFile({
            adaptor: adaptor
        });
        try {
            if (options.mode === "add") {
                const fundingContent = await fetchFundingFile(korefile).catch((error) => {
                    // No Contents
                    if (error.status === 404) {
                        return {};
                    }
                    // other error
                    return Promise.reject(error);
                });
                const shouldUpdate = !hasUserInFunding(fundingContent, options.user);
                if (!options.silent) {
                    console.info(`${repoMark}: ${shouldUpdate ? "Try to Update" : "No Update"}`);
                }
                if (!options.dryRun && shouldUpdate) {
                    const newContent = addUserToFunding(fundingContent, options.user);
                    await writeFundingFile(korefile, newContent);
                }
            } else if (options.mode === "delete") {
                const fundingContent = await fetchFundingFile(korefile);
                const shouldUpdate = hasUserInFunding(fundingContent, options.user);
                if (!options.silent) {
                    console.info(`${repoMark}: ${shouldUpdate ? "Try to Delete" : "No Update"}`);
                }
                if (!options.dryRun) {
                    const newContent = deleteUserToFunding(fundingContent, options.user);
                    const isEmptyObject = Object.keys(newContent).length === 0;
                    if (isEmptyObject) {
                        await deleteFundingFile(korefile);
                    } else {
                        await writeFundingFile(korefile, newContent);
                    }
                }
            }
        } catch (error) {
            if (!options.silent) {
                console.error(`[${repoMark}]: Error: ${error}`);
            }
        }
    }
};
