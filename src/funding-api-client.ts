import yaml from "js-yaml";
import { KoreFile } from "korefile";

const FUNDING_PATH = ".github/FUNDING.yml";
export const fetchFundingFile = (koreFile: KoreFile, filePath = FUNDING_PATH) => {
    return koreFile.readFile(filePath).then((result) => {
        return yaml.safeLoad(result);
    });
};
export const writeFundingFile = (koreFile: KoreFile, fundingContent: object, filePath = FUNDING_PATH) => {
    const yamlContent = yaml.safeDump(fundingContent);
    return koreFile.writeFile(filePath, yamlContent);
};
export const deleteFundingFile = (koreFile: KoreFile, filePath = FUNDING_PATH) => {
    return koreFile.deleteFile(filePath);
};
