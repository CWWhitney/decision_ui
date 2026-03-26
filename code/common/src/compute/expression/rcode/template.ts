import { R_CODE_LINE_BREAK } from "./base";

export const indentCode = (code: string | null, ident = "    ") => {
    if (!code) {
        return null;
    }
    return code
        .split(R_CODE_LINE_BREAK)
        .map(l => `${ident}${l}`)
        .join(R_CODE_LINE_BREAK);
};

export const getRCodeHistogramTemplate = (
    modelFunctionCode: string,
    resultVariables: string[],
    estimatesFilepath: string,
    resultsFilepath: string,
    mcRuns: number,
    histogramBins: number
) => {
    return `options(warn=1)
library(readr)
library(decisionSupport)

# load estmates from csv file
input_estimates <- estimate_read_csv("${estimatesFilepath}")

# define model function based on variable nodes
model_function <- function() {
${indentCode(modelFunctionCode)}

	# generate list of output variables
	return(list(${resultVariables.map(v => `${v}=${v}`).join(", ")}))
}

# do monte carlo simulation
mc <- mcSimulation(estimate=input_estimates,
		model_function=model_function,
		numberOfModelRuns=${mcRuns},
		functionSyntax='plainNames')

# calculate common histogram bins
bins <- hist(unlist(mc["y"]$y), breaks=${histogramBins}, plot=FALSE)$breaks

# count occurrences for each result variable
counts <- lapply(mc["y"]$y, function(r) hist(r, breaks=bins, plot=FALSE)$counts)

# combine bins and counts together in one data frame
results <- data.frame(bins=head(bins, -1), counts)

# write results to csv file
write_csv(results, "${resultsFilepath}")
`;
};

export const getRCodeEvpiTemplate = (
    modelFunctionCode: string,
    resultVariables: string[],
    estimatesFilepath: string,
    resultsFilepath: string,
    mcRuns: number
) => {
    return `options(warn=1)
library(readr)
library(decisionSupport)

# load estmates from csv file
input_estimates <- estimate_read_csv("${estimatesFilepath}")

# define model function based on variable nodes
model_function <- function() {
${indentCode(modelFunctionCode)}

	# generate list of output variables
	return(list(${resultVariables.map(v => `${v}=${v}`).join(", ")}))
}

# do monte carlo simulation
mc <- mcSimulation(estimate=input_estimates,
		model_function=model_function,
		numberOfModelRuns=${mcRuns},
		functionSyntax='plainNames')

# prepare monte carlo simulation results for EVPI analysis
first_out_var <- colnames(mc$y)[1]
mc_table <- data.frame(mc$x, mc$y)

# do EVPI analysis
evpi <- multi_EVPI(mc=mc_table, first_out_var = first_out_var, write_table = FALSE, outfolder = NA)

# extract EVPI results
evpi_res = data.frame(variable = evpi[[1]]$variable)
for (i in 1:length(evpi)){
  evpi_res[names(evpi)[i]] = evpi[[i]]$EVPI
}

# write EVPI results to csv file
write_csv(evpi_res, "${resultsFilepath}")
`;
};
