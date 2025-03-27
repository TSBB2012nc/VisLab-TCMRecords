export function fillColor(herb, colorMap, selection) {
    if (!(herb in colorMap)) return "";

    const category = selection === 0 ? colorMap[herb] : colorMap[herb][selection === 1 ? '教材分类' : '专家分类'];
    if (!category) return "";

    const [r, g, b] = category;
    return `rgb(${r}, ${g}, ${b})`;
}
