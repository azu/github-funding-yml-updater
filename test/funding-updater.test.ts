import { addUserToFunding, deleteUserToFunding } from "../src/funding-updater";
import * as assert from "assert";

describe("funding-updater", function() {
    it("should add if not exist user", () => {
        const content = {
            patreon: "patreon-user"
        };
        const newContent = addUserToFunding(content, "gh-user");
        assert.deepStrictEqual(newContent, {
            ...content,
            github: "gh-user"
        });
    });
    it("should merge if exist some user", () => {
        const content = {
            patreon: "patreon-user",
            github: "gh-user-1"
        };
        const newContent = addUserToFunding(content, "gh-user-2");
        assert.deepStrictEqual(newContent, {
            ...content,
            github: ["gh-user-1", "gh-user-2"]
        });
    });
    it("should delete github key if not exist user", () => {
        const content = {
            patreon: "patreon-user",
            github: "gh-user"
        };
        const newContent = deleteUserToFunding(content, "gh-user");
        assert.deepStrictEqual(newContent, {
            patreon: "patreon-user"
        });
    });
    it("should delete but preserve other users if exist some user", () => {
        const content = {
            patreon: "patreon-user",
            github: ["gh-user-1", "gh-user-2"]
        };
        const newContent = deleteUserToFunding(content, "gh-user-2");
        assert.deepStrictEqual(newContent, {
            ...content,
            github: ["gh-user-1"]
        });
    });
});
