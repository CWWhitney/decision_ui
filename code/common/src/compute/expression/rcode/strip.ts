/**
 * Strip all special characters from a comment to make sure that a comment cannot be used to inject code.
 *
 * @param comment the comment
 * @returns the safe comment with stripped newline characters, mostly only allowing letters
 */
export const stripRComment = (comment: string) => {
    return comment.replace(/[^\p{L} \\(\\)\\/\\^]/gu, "");
};
