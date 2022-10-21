const fs = require("fs");
const { RawSource } = require("webpack-sources");

function checkUIMode(source) {
  return /(^|\n|\\n)\s*(['"])ui\2/.test(source);
}

function appendHeader(source) {
  const headers = `"ui";`;

  return `${headers}\n${source}`;
}

function transformXml(xmlContent) {
  const wrapMatches = xmlContent.match(/<!--\s*wrap:\s*([\w.-]+)\s*-->/);

  let wrap = "ui.layout";

  if (wrapMatches) {
    wrap = wrapMatches[1];
  }

  return `${wrap}(
    ${xmlContent}
  )`;
}

function appendXML(source) {
  const regexp =
    /exports="__XML_TRANSFORM_BEGIN__([\d\D]*?)__XML_TRANSFORM_END__"/g;

  return source.replace(regexp, (match, xmlPath) => {
    const xmlContent = fs.readFileSync(xmlPath, { encoding: "utf8" });

    return `exports=function(){ global.__ARGS__ = [].slice.call(arguments); global.__ARG0__ = global.__ARGS__[0]; global.__ARG1__ = global.__ARGS__[1]; global.__ARG2__ = global.__ARGS__[2]; global.__ARG3__ = global.__ARGS__[3]; global.__ARG4__ = global.__ARGS__[4]; global.__ARG5__ = global.__ARGS__[5]; global.__ARG6__ = global.__ARGS__[6]; global.__ARG7__ = global.__ARGS__[7]; global.__ARG8__ = global.__ARGS__[8]; global.__ARG9__ = global.__ARGS__[9]; global.__ARG10__ = global.__ARGS__[10];global.__ARG11__ = global.__ARGS__[11];global.__ARG12__ = global.__ARGS__[12];global.__ARG13__ = global.__ARGS__[13];global.__ARG14__ = global.__ARGS__[14];global.__ARG15__ = global.__ARGS__[15];global.__ARG16__ = global.__ARGS__[16];global.__ARG17__ = global.__ARGS__[17];global.__ARG18__ = global.__ARGS__[18];global.__ARG19__ = global.__ARGS__[19];global.__ARG20__ = global.__ARGS__[20];global.__ARG21__ = global.__ARGS__[21];global.__ARG22__ = global.__ARGS__[22];global.__ARG23__ = global.__ARGS__[23];global.__ARG24__ = global.__ARGS__[24];global.__ARG25__ = global.__ARGS__[25];global.__ARG26__ = global.__ARGS__[26];global.__ARG27__ = global.__ARGS__[27];global.__ARG28__ = global.__ARGS__[28];global.__ARG29__ = global.__ARGS__[29];global.__ARG30__ = global.__ARGS__[30];global.__ARG31__ = global.__ARGS__[31];global.__ARG32__ = global.__ARGS__[32];global.__ARG33__ = global.__ARGS__[33];global.__ARG34__ = global.__ARGS__[34];global.__ARG35__ = global.__ARGS__[35];global.__ARG36__ = global.__ARGS__[36];global.__ARG37__ = global.__ARGS__[37];global.__ARG38__ = global.__ARGS__[38];global.__ARG39__ = global.__ARGS__[39];global.__ARG40__ = global.__ARGS__[40];global.__ARG41__ = global.__ARGS__[41];global.__ARG42__ = global.__ARGS__[42];global.__ARG43__ = global.__ARGS__[43];global.__ARG44__ = global.__ARGS__[44];global.__ARG45__ = global.__ARGS__[45];global.__ARG46__ = global.__ARGS__[46];global.__ARG47__ = global.__ARGS__[47];global.__ARG48__ = global.__ARGS__[48];global.__ARG49__ = global.__ARGS__[49];global.__ARG50__ = global.__ARGS__[50];global.__ARG51__ = global.__ARGS__[51];global.__ARG52__ = global.__ARGS__[52];global.__ARG53__ = global.__ARGS__[53];global.__ARG54__ = global.__ARGS__[54];global.__ARG55__ = global.__ARGS__[55];global.__ARG56__ = global.__ARGS__[56];global.__ARG57__ = global.__ARGS__[57];global.__ARG58__ = global.__ARGS__[58];global.__ARG59__ = global.__ARGS__[59];global.__ARG60__ = global.__ARGS__[60];global.__ARG61__ = global.__ARGS__[61];global.__ARG62__ = global.__ARGS__[62];global.__ARG63__ = global.__ARGS__[63];global.__ARG64__ = global.__ARGS__[64];global.__ARG65__ = global.__ARGS__[65];global.__ARG66__ = global.__ARGS__[66];global.__ARG67__ = global.__ARGS__[67];global.__ARG68__ = global.__ARGS__[68];global.__ARG69__ = global.__ARGS__[69];global.__ARG70__ = global.__ARGS__[70];global.__ARG71__ = global.__ARGS__[71];global.__ARG72__ = global.__ARGS__[72];global.__ARG73__ = global.__ARGS__[73];global.__ARG74__ = global.__ARGS__[74];global.__ARG75__ = global.__ARGS__[75];global.__ARG76__ = global.__ARGS__[76];global.__ARG77__ = global.__ARGS__[77];global.__ARG78__ = global.__ARGS__[78];global.__ARG79__ = global.__ARGS__[79];global.__ARG80__ = global.__ARGS__[80];global.__ARG81__ = global.__ARGS__[81];global.__ARG82__ = global.__ARGS__[82];global.__ARG83__ = global.__ARGS__[83];global.__ARG84__ = global.__ARGS__[84];global.__ARG85__ = global.__ARGS__[85];global.__ARG86__ = global.__ARGS__[86];global.__ARG87__ = global.__ARGS__[87];global.__ARG88__ = global.__ARGS__[88];global.__ARG89__ = global.__ARGS__[89];global.__ARG90__ = global.__ARGS__[90];global.__ARG91__ = global.__ARGS__[91];global.__ARG92__ = global.__ARGS__[92];global.__ARG93__ = global.__ARGS__[93];global.__ARG94__ = global.__ARGS__[94];global.__ARG95__ = global.__ARGS__[95];global.__ARG96__ = global.__ARGS__[96];global.__ARG97__ = global.__ARGS__[97];global.__ARG98__ = global.__ARGS__[98];global.__ARG99__ = global.__ARGS__[99]; return ${transformXml(
      xmlContent
    )}};
`;
  });
}

class AutoJsUiPlugin {
  constructor() {}

  apply(compiler) {
    compiler.hooks.compilation.tap("AutoJsUiPlugin", (compilation) => {
      compilation.hooks.afterOptimizeChunkAssets.tap(
        "AutoJsUiPlugin",
        (chunks) => {
          for (const chunk of chunks) {
            if (chunk.canBeInitial()) {
              chunk.files.forEach((file) => {
                let source = compilation.assets[file].source();
                if (checkUIMode(source)) {
                  source = appendHeader(source);
                }
                source = appendXML(source);

                compilation.assets[file] = new RawSource(source);
              });
            }
          }
        }
      );
    });
  }
}

module.exports = AutoJsUiPlugin;
