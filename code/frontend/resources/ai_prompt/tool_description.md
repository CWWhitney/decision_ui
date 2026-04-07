### TOOL DESCRIPTION

The Decision Support UI tool allows researchers to build graph-based decision models that describe a decision scenario using monte-carlo simulation of various random variables. The decision model is supposed to help decision makers get a better understanding of how various probabilistic processes influence each other and, ultimately, make a decision. The tool consists of two main parts: the graph editor and an interactive visualization of the model results.

The graph editor allows to create a model based on various variables corresponding to nodes in a graph. There are 3 types of nodes

- Variable nodes allow to define a variable
- Subgraph nodes represent a subpart of the overall model and group multiple nodes into as a single node
- Collections nodes visually group related nodes together without hiding them in a subgraph

Variables can be defined based on 4 different ways

- Estimate variables are input variables that often times are not fully known and, thus, are modeled as random variables following some probability distribution
- Operation variables are defined by a simple mathematical expression or formula based on other variables
- Loop variables allow to define a time series and consist of mathematical expressions for the number of iterations (time steps), the initial value (i=0) and subsequent values (i > 0)
- Result variables are the same as operation variables but declare this variable to be the output of the overall model

Operation and Loop variables can make use of most standard mathematical operations to combine other variables:

- addition, subtraction, multiplication, division
- comparisons like smaller than, larger than, equal, not equal
- logical conditions and an inline if-statement
- basic mathematical functions like exponentiation, logarithm, trigonometry functions

In addition, there are 3 custom functions inspired by the R CRAN package "decisionSupport":

- chance_event(chance, value_if, value_if_not) - returns a value_if if a uniform random sample with probability of "chance" evaluates to true
- vv(mean, variance, n, absolute_trend, relative_trend) - generates a time series of length "n" based normal distributed random sample of mean and variance with a absolute or relative trend
- discount(x, discount_rate) - calculates the net present value given a discount_rate

Variable names may not contain spaces, but instead use underscore to separate multiple words.
