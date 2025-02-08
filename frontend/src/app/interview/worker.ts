
//self.addEventListener("message", (e: MessageEvent<string>) => {
//  console.log(e.data)
//  const { code, language } = e.data;
//  const fn = new Function(code);
//  const result = fn();
//  //const result = eval(`(${code})();`);
//  //const result = eval( toString(function Calculate() { return 1 + 2 })() )
//  self.postMessage(result);
//
//  //try {
//  //  const result = new Function(code)();
//  //  self.postMessage(result);
//  //} catch (error) {
//  //  self.postMessage(`Error: ${(error as Error).message}`);
//  //}
//});
//
//export {};
self.addEventListener("message", (e: MessageEvent<string>) => {
  try {
    const { code, language } = e.data;

    // Wrap the code in parentheses to treat it as an expression, then invoke it
    const result = eval(`(${code})()`); 
    console.log(result);
    self.postMessage(result);
  } catch (error) {
    self.postMessage(`Error: ${error.message}`);
  }
});

export {};
