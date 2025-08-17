import type { INestiaConfig } from "@nestia/sdk";

const config: INestiaConfig = {
  output: "api-sdk/src",
  input: 'src/**/*.controller.ts',
  clone: true
};

export default config;