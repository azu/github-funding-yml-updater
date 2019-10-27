import { createRepositoryList } from "./create-repository-list";
import meow from "meow";
import * as fs from "fs";
import * as path from "path";

export interface runOptions {
    // line-separated owner/repo list
    listContent: string;
}

/**
 * Start CLI
 */
export const start = () => {
    const cli = meow(`
	Usage
	  $ github-funding-yml-settings [options]

	Options
	  --list-file input list file path. list file includes line-separated repository list for setting

	Examples
	  $ github-funding-yml-settings --list-file list.txt
`, {
        flags: {
            listFile: {
                type: "string"
            }
        }
    });

    const listContent = fs.readFileSync(path.join(process.cwd(), cli.flags.listFile), "utf-8");
    if (!listContent) {
        throw new Error("list-file is empty");
    }
    return run({
        listContent: listContent
    });
};
/**
 * Run from CLI
 * @param options
 */
export const run = (options: runOptions) => {
    const repositoryList = createRepositoryList(options.listContent);
    repositoryList.map(repository => {
        return `https://github.com/${repository.owner}/${repository.repo}/settings#repository-funding-links-feature`;
    }).forEach(link => {
        console.log(link);
    });
};
