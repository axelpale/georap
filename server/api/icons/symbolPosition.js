module.exports = (templateSize, symbolSize) => {
  // Parameters:
  //   templateSize
  //     { width, height }
  //   symbolSize
  //     { width, height }
  //
  // Return
  //   { top, left }
  //
  const margin = Math.floor((templateSize.width - symbolSize.width) / 2);
  return {
    top: margin + 1,
    left: margin,
  };
};
