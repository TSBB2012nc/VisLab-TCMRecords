export function fillColor(herb, colorMap, seletion) {
    if (herb in colorMap) {
        // 返回rgb字符串
        let r, g, b;
        if (seletion == 0) {
            [r, g, b] = colorMap[herb];
        } else if (seletion == 1) {
            [r, g, b] = colorMap[herb]['教材分类'];
        } else {
            [r, g, b] = colorMap[herb]['专家分类'];
        }
        return `rgb(${r}, ${g}, ${b})`
    } else {
        return "";
    }
}