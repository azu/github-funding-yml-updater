import { safeLoad } from "js-yaml";

export const parseYaml = (yaml: string) => {
    try {
        return safeLoad(yaml);
    } catch (error) {
        return error;
    }
};
