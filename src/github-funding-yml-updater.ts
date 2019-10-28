import { createGitHubAdaptor, createKoreFile, KoreFileAdaptor } from "korefile";
import { deleteFundingFile, fetchFundingFile, writeFundingFile } from "./funding-api-client";
import { addUserToFunding, deleteUserToFunding, hasUserInFunding } from "./funding-updater";
import { parseYaml } from "./yaml-utils";

export interface Repository {
    owner: string;
    repo: string;
    // heads/master
    ref?: string;
    token: string;
}

export type CommonOptions = {
    repositoryList: Repository[]
    dryRun: boolean;
    silent: boolean;
    createAdaptor?: (repository: Repository) => KoreFileAdaptor
}
export type AddOptionsPart = {
    mode: "add"
    // add user
    user: string;
}
export type AddOptions = AddOptionsPart & CommonOptions;
export type DeleteOptionPart = {
    mode: "delete"
    // add user
    user: string;
};
export type DeleteOptions = DeleteOptionPart & CommonOptions;
export type OverwriteOptionsPart = {
    mode: "overwrite"
    // funding content for overwrite
    fundingContentRaw: string;
};
export type OverwriteOptions = OverwriteOptionsPart & CommonOptions

export type updateFundingOptions = AddOptions | DeleteOptions | OverwriteOptions;
export const updateFunding = async (options: updateFundingOptions) => {
    if (!options.silent) {
        console.info(options.dryRun ? "[DryRun]" : "[Write]");
        console.info(`Mode: ${options.mode}`);
        if (options.mode === "add" || options.mode === "delete") {
            console.info(`User: ${options.user}`);
        } else if (options.mode === "overwrite") {
            console.info(`Funding File:`);
            console.info(`-------------`);
            console.info(options.fundingContentRaw);
            console.info(`-------------`);
        }
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
                const user = options.user;
                const fundingContent = await fetchFundingFile(korefile).catch((error) => {
                    // No Contents
                    if (error.status === 404) {
                        return {};
                    }
                    // other error
                    return Promise.reject(error);
                });
                const shouldUpdate = !hasUserInFunding(fundingContent, user);
                if (!options.silent) {
                    console.info(`${repoMark}: ${shouldUpdate ? "Try to Update" : "No Update"}`);
                }
                if (!options.dryRun && shouldUpdate) {
                    const newContent = addUserToFunding(fundingContent, user);
                    await writeFundingFile(korefile, newContent);
                }
            } else if (options.mode === "delete") {
                const user = options.user;
                const fundingContent = await fetchFundingFile(korefile);
                const shouldUpdate = hasUserInFunding(fundingContent, user);
                console.log("shouldUpdate", fundingContent);
                if (!options.silent) {
                    console.info(`${repoMark}: ${shouldUpdate ? "Try to Delete" : "No Update"}`);
                }
                if (!options.dryRun && shouldUpdate) {
                    const newContent = deleteUserToFunding(fundingContent, user);
                    const isEmptyObject = Object.keys(newContent).length === 0;
                    if (isEmptyObject) {
                        await deleteFundingFile(korefile);
                    } else {
                        await writeFundingFile(korefile, newContent);
                    }
                }
            } else if (options.mode === "overwrite") {
                const fundingContentRaw = options.fundingContentRaw;
                const fundingContent = parseYaml(fundingContentRaw);
                if (fundingContent instanceof Error) {
                    throw new Error(`fundingFile is not valid yaml file:
Error: ${fundingContent.message}

${fundingContent}                    
`);
                }
                if (!options.silent) {
                    console.info(`${repoMark}: "Try to Overwrite"`);
                }
                if (!options.dryRun) {
                    // overwrite
                    await writeFundingFile(korefile, fundingContent);
                }
            }
        } catch (error) {
            if (!options.silent) {
                console.error(`[${repoMark}]: Error: ${error}`);
            }
        }
    }
};
