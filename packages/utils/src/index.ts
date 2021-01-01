import { ethers } from "ethers";

export interface ArgDecoded {
  raw: string;
  funcFragment?: ethers.utils.FunctionFragment;
  parsedArgs?: ArgDecoded[];
  type?: string;
  name?: string;
}

// Analyse transaction arguments, and recursively check if an argument is
// an encoded function call
export const analyseTxData = (
  raw: string,
  knownInterfaces: ethers.utils.Interface[]
): ArgDecoded => {
  var args: ethers.utils.Result | undefined;
  var funcFragment: ethers.utils.FunctionFragment | undefined;
  var found = false;
  for (let i of knownInterfaces) {
    // try to decode an encoded function call
    try {
      // decode arguments into array
      args = i.decodeFunctionData(ethers.utils.hexDataSlice(raw, 0, 4), raw);
      // get ethersjs function fragment (name and inputs types)
      funcFragment = i.getFunction(ethers.utils.hexDataSlice(raw, 0, 4));
      found = true;
      break;
    } catch (error) {
      // try another interface
      continue;
    }
  }
  if (!found) {
    // not an encoded function call, return the argument
    return { raw };
  }
  // inject the type of each argument object into parsedArgs
  const parsedArgs = args!.map((argCall, i) => {
    return {
      ...analyseTxData(argCall, knownInterfaces),
      type: funcFragment!.inputs[i].type,
      name: funcFragment!.inputs[i].name,
    };
  });
  return { funcFragment, parsedArgs, raw };
};
