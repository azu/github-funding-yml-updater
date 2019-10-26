import { createRepositoryList } from "./create-repository-list";
import { Repository, updateFunding } from "./github-funding-yml-updater";
import meow from "meow";
import * as fs from "fs";

export interface runOptions {
    mode: "add" | "delete"
    user: string;
    // line-separated owner/repo list
    listContent: string;
    // dry-run by default
    write: boolean;
    // github token
    token: string;
}

/**
 * Start CLI
 */
export const start = () => {
    const cli = meow(`
	Usage
	  $ github-funding-yml-updater [options]

	Options
	  --mode "add" or "delete"
	  --user GitHub account name
	  --list-file input list file path. list file includes line-separated repository list for updating
	  --write update GitHub repository if set it. Default: dry-run(no update)
	  --token GitHub Token(or env GITHUB_TOKEN=xxx)

	Examples
	  # Dry-run by default
	  $ github-funding-yml-updater --mode add --user azu --list-file list.txt --token XXXX
	  # Update Repository
	  $ github-funding-yml-updater --mode add --user azu --list-file list.txt --token XXXX --write
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
        cli.showHelp();
    }
    if (cli.flags.mode === undefined) {
        console.error("--mode is not set");
        cli.showHelp();
    }
    if (cli.flags.user === undefined) {
        console.error("--user is not set");
        cli.showHelp();
    }
    if (cli.flags.listFile === undefined) {
        console.error("--list-file is not set");
        cli.showHelp();
    }
    const listContent = fs.readFileSync(cli.flags.listFile, "utf-8");
    if (!listContent) {
        throw new Error("list-file is empty");
    }
    return run({
        mode: cli.flags.mode,
        write: cli.flags.write,
        user: cli.flags.user,
        listContent: cli.flags.listContent,
        token: GITHUB_TOKEN
    });
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
        user: options.user,
        // dry-run by default
        dryRun: !options.write,
        mode: options.mode,
        silent: false
    });
};
