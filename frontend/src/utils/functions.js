export const getShadowByRarity = (rarity, width = 4, height = 8) => {
  switch (rarity) {
    case "common":
      return `0 ${width}px ${height}px rgba(117, 117, 117, 0.5)`;
    case "uncommon":
      return `0 ${width}px  ${height}px rgba(56, 142, 60, 0.5)`;
    case "rare":
      return `0 ${width}px  ${height}px rgba(25, 118, 210, 0.5)`;
    case "epic":
      return `0 ${width}px  ${height}px rgba(142, 36, 170, 0.5)`;
    case "legendary":
      return `0 ${width}px  ${height}px rgba(245, 124, 0, 0.5)`;
    default:
      return `0 ${width}px  ${height}px rgba(117, 117, 117, 0.5)`;
  }
};
export const getStyleByRarity = (rarity) => {
  switch (rarity) {
    case "common":
      return { color: "gray", fontWeight: "normal" };
    case "uncommon":
      return { color: "#388E3C", fontWeight: "bold" };
    case "rare":
      return { color: "#1976D2", fontWeight: "bold" };
    case "epic":
      return { color: "#8E24AA", fontWeight: "bold" };
    case "legendary":
      return { color: "#F57C00", fontWeight: "bold" };
    default:
      return { color: "gray", fontWeight: "normal" };
  }
};
// add other functions here...
