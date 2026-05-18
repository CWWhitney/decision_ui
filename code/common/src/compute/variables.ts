/**
 * The list of reserved R words and constants, see `help(reserved)`
 * and https://stat.ethz.ch/R-manual/R-devel/library/base/html/Constants.html.
 */
export const RESERVED_R_WORDS = [
    "if",
    "else",
    "repeat",
    "while",
    "function",
    "for",
    "in",
    "next",
    "break",
    "true",
    "false",
    "null",
    "inf",
    "nan",
    "na",
    "na_integer_",
    "na_real_",
    "na_complex_",
    "na_character_",
    "..."
];

export const R_FUNCTIONS = ["options", "library", "help", "lapply"];

export const R_CONSTANTS = ["pi", "letters", "month.abb", "month.name"];

export const DSUI_RESERVED_WORDS = [
    "mcSimulation",
    "hist",
    "mc",
    "bins",
    "input_estimates",
    "counts",
    "results",
    "write_csv"
];

export const generateVariableName = (title: string) => {
    const RE_LATIN = "a-zA-Z";
    const RE_NUMBERS = "0-9";
    const RE_GERMAN = "äÄüÜöÖß";

    // Vietnamese characters, source: https://stackoverflow.com/a/46265018
    const RE_VIETNAMESE =
        "àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹý" +
        "ÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ";

    const filter = new RegExp(`[^${RE_LATIN}${RE_NUMBERS}${RE_GERMAN}${RE_VIETNAMESE}_]`, "g");
    return title.normalize("NFC").trim().replace(/ /g, "_").replace(filter, "");
};

export const isVariableNameReserved = (variableName: string): boolean => {
    if (!variableName) {
        return true;
    }
    const lowerVarName = variableName.toLowerCase().trim();
    if (
        RESERVED_R_WORDS.includes(lowerVarName) ||
        R_FUNCTIONS.includes(lowerVarName) ||
        R_CONSTANTS.includes(lowerVarName) ||
        DSUI_RESERVED_WORDS.includes(lowerVarName)
    ) {
        return true;
    }

    if (lowerVarName.startsWith("..")) {
        return true;
    }

    return false;
};

export const getVariableNameError = (
    variableName: string,
    nodeNameByDuplicate: { [name: string]: string[] }
): string | null => {
    if (!variableName || !variableName.trim()) {
        return `Variable name cannot be empty!`;
    }

    if (isVariableNameReserved(variableName)) {
        return `Variable name '${variableName}' is a reserved keyword, please choose another name!`;
    }

    if (variableName in nodeNameByDuplicate) {
        const nodeList = nodeNameByDuplicate[variableName].map(n => `'${n}'`).join(", ");
        return (
            `Variable name '${variableName}' cannot be used by ` +
            `different nodes (${nodeList}) and needs to be unique!`
        );
    }

    return null;
};
