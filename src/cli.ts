import { createRepositoryList } from "./create-repository-list";
import {
    AddOptionsPart,
    DeleteOptionPart,
    OverwriteOptionsPart,
    Repository,
    updateFunding
} from "./github-funding-yml-updater";
import meow from "meow";
import * as fs from "fs";
import * as path from "path";

export type runCommonOptions = {
    // line-separated owner/repo list
    listContent: string;
    // dry-run by default
    write: boolean;
    // github token
    token: string;
};
export type runAddOptions = AddOptionsPart & runCommonOptions;
export type runDeleteOptions = DeleteOptionPart & runCommonOptions;
export type runOverwriteOptions = OverwriteOptionsPart & runCommonOptions;
export type runOptions = runAddOptions | runDeleteOptions | runOverwriteOptions;

/**
 * Start CLI
 */
export const start = () => {
    const cli = meow(`
	Usage
	  $ github-funding-yml-updater [options]

	Options
	  --mode "add", "delete", or "overwrite"
	    --mode "add" and --mode "delete" require --user argument
	    --mode "delete" require --funding-file argument
      --user GitHub account name
	  --list-file input list file path. list file includes line-separated repository list for updating
	  --funding-file input FUNDING.yml file path. It is for --mode overwrite
	  --write update GitHub repository if set it. Default: dry-run(no update)
	  --token GitHub Token(or env GITHUB_TOKEN=xxx)

	Examples
	  # Dry-run by default
	  $ github-funding-yml-updater --mode add --user azu --list-file list.txt --token XXXX
	  # Add user to Repository
	  $ github-funding-yml-updater --mode add --user azu --list-file list.txt --token XXXX --write
      # Delete user from Repository
	  $ github-funding-yml-updater --mode delete --user azu --list-file list.txt --token XXXX --write
	  # Overwrite using existing FUNDING.yml
      $ github-funding-yml-updater --mode overwrite --funding-file ./FUNDING.yml --list-file list.txt --token XXXX --write
`, {
        flags: {
            mode: {
                type: "string"
            },
            user: {
                type: "string"
            },
            listFile: {
                type: "string"
            },
            fundingFile: {
                type: "string"
            },
            write: {
                type: "boolean"
            },
            token: {
                type: "string"
            }
        }
    });

    const GITHUB_TOKEN = cli.flags.token || process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
        console.error("GitHub Token is not set");
        return cli.showHelp();
    }
    const mode: "add" | "delete" | "overwrite" | undefined = cli.flags.mode;
    if (mode === undefined) {
        console.error("--mode is not set");
        return cli.showHelp();
    }
    if (cli.flags.listFile === undefined) {
        console.error("--list-file is not set");
        return cli.showHelp();
    }
    const listContent = fs.readFileSync(path.join(process.cwd(), cli.flags.listFile), "utf-8");
    if (!listContent) {
        throw new Error("list-file is empty");
    }
    if (mode === "overwrite") {
        const fundingFile: string | undefined = cli.flags.fundingFile;
        if (!fundingFile) {
            throw new Error("--mode overwrite require --funding-file options");
        }
        const fundingContentForOverwrite = fs.readFileSync(path.join(process.cwd(), fundingFile), "utf-8");
        return run({
            mode: mode,
            write: cli.flags.write,
            listContent: listContent,
            fundingContentRaw: fundingContentForOverwrite,
            token: GITHUB_TOKEN
        });
    } else if (mode === "add") {
        const user: string | undefined = cli.flags.user;
        if (!user) {
            throw new Error(`--mode add require --user options`);
        }
        return run({
            mode: mode,
            user: user,
            write: cli.flags.write,
            listContent: listContent,
            token: GITHUB_TOKEN
        });
    } else if (mode === "delete") {
        const user: string | undefined = cli.flags.user;

        if (!user) {
            throw new Error(`--mode delete require --user options`);
        }
        return run({
            mode: mode,
            user: user,
            write: cli.flags.write,
            listContent: listContent,
            token: GITHUB_TOKEN
        });
    }
};
/**
 * Run from CLI
 * @param options
 */
export const run = (options: runOptions) => {
    const repositoryList = createRepositoryList(options.listContent);
    const repositoryListWithToken: Repository[] = repositoryList.map(repository => {
        return {
            ...repository,
            ref: repository.branch ? `heads/${repository.branch}` : undefined,
            token: options.token
        };
    });
    return updateFunding({
        repositoryList: repositoryListWithToken,
        dryRun: !options.write,
        silent: false,
        ...options
    });
};
