import { createRepositoryList } from "../src/create-repository-list";
import * as assert from "assert";

describe("create-repository-list", function() {
    it("should create {owner,repo} list from text", () => {
        const text = `
azu/example1
azu/example2
example/example        
`;
        const list = createRepositoryList(text);
        assert.deepStrictEqual(list, [
            {
                "owner": "azu",
                "repo": "example1"
            },
            {
                "owner": "azu",
                "repo": "example2"
            },
            {
                "owner": "example",
                "repo": "example"
            }
        ]);
    });
    it("should support {owner,repo,branch} list from text", () => {
        const text = `
azu/example1@master
azu/example2@dev
example/example        
`;
        const list = createRepositoryList(text);
        assert.deepStrictEqual(list, [
            {
                "owner": "azu",
                "repo": "example1",
                "branch": "master"
            },
            {
                "owner": "azu",
                "repo": "example2",
                "branch": "dev"
            },
            {
                "owner": "example",
                "repo": "example"
            }
        ]);
    });
    it("should remove invalid pattern from text", () => {
        const text = `
azu/example1

invalida te?? 

azu/example2
example/example        
`;
        const list = createRepositoryList(text);
        assert.deepStrictEqual(list, [
            {
                "owner": "azu",
                "repo": "example1"
            },
            {
                "owner": "azu",
                "repo": "example2"
            },
            {
                "owner": "example",
                "repo": "example"
            }
        ]);
    });
});
