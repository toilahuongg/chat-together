export const classNames = 
(
    styles: {
        [key: string]: string;
    },
    values: string[],
) => {
    return values.map((value) => styles[value]).join(' ');
}