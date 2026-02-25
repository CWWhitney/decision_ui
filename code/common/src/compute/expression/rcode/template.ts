import { R_CODE_LINE_BREAK } from "./base";

export const identCode = (code: string | null, ident = "    ") => {
    if (!code) {
        return null;
    }
    return code
        .split(R_CODE_LINE_BREAK)
        .map(l => `${ident}${l}`)
        .join(R_CODE_LINE_BREAK);
};

export const getRCodeTemplate = (
    modelFunctionCode: string,
    resultVariables: string[],
    estimatesFilepath: string,
    resultsFilepath: string,
    mcRuns: number
) => {
    return `options(warn=1)
library(readr)
library(decisionSupport)

input_estimates <- estimate_read_csv("${estimatesFilepath}")

model_function <- function() {
${identCode(modelFunctionCode)}

	# generate list of output variables
	return(list(${resultVariables.map(v => `${v}=${v}`).join(", ")}))
}


mc <- mcSimulation(estimate=input_estimates,
		model_function=model_function,
		numberOfModelRuns=${mcRuns},
		functionSyntax='plainNames')


write_csv(data.frame(mc["y"]), "${resultsFilepath}")`;
};
