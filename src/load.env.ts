import * as yaml from 'js-yaml';
import { readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

const rootDirectory = dirname(__dirname);
const dataConfig = [];
dataConfig['.env'] = dotenv.config().parsed;

dataConfig['directories'] = {
  root: rootDirectory,
  envs: join(rootDirectory, 'envs'),
  logs: join(rootDirectory, 'logs'),
  src: join(rootDirectory, 'src'),
};

const regexOnFileDirEnvs = new RegExp(`.${dataConfig['.env']['mode']}.`, 'i');

for (const file of readdirSync(dataConfig['directories'].envs)) {
  const name = file.split('.')[0];

  if (regexOnFileDirEnvs.exec(file)) {
    dataConfig[name] = yaml.load(
      readFileSync(join(dataConfig['directories'].envs, file), 'utf8'),
    ) as Record<string, any>;
    continue;
  }

  const regexSimpleFileYaml = new RegExp(`${name}.yaml`, 'i');
  const regexSimpleFileYml = new RegExp(`${name}.yml`, 'i');

  if (
    (regexSimpleFileYaml.exec(file) || regexSimpleFileYml.exec(file)) &&
    dataConfig[name] == undefined
  ) {
    dataConfig[name] = yaml.load(
      readFileSync(join(dataConfig['directories'].envs, file), 'utf8'),
    ) as Record<string, any>;
  }
}

// Adding specific variable of environnemts into dataConfig

export const Environement = dataConfig;
