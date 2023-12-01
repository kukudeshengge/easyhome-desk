/** @type {import('next').NextConfig} */
// NODE_ENV:开发环境=development，其他无值
const { NODE_ENV } = process.env;
const locEnv = '';
// const locEnv = 'dev';
//测试环境配置
const testConfig = {
    wss: 'wss://build-blocks-server-topic-0gto6chq2e050557-1309807507.ap-shanghai.run.wxcloudrun.com',
    baseDomain: `https://gateway${locEnv}.jrdaimao.com`,
    omDomain: `https://om${locEnv}.jrdaimao.com`,
};
//生产环境配置
const productionConfig = {
    wss: 'wss://build-blocks-server-topic-2gkyct5qcd4f6d1b-1307653693.ap-shanghai.run.wxcloudrun.com',
    baseDomain: 'https://gateway.jrdaimao.com',
    omDomain: 'https://om.jrdaimao.com',
};

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        unoptimized: true,
    },
    poweredByHeader: false,
    distDir: 'build',
    env: NODE_ENV === 'development' ? testConfig : productionConfig,
    publicRuntimeConfig: {
        NODE_ENV,
    },
    experimental: {
        urlImports: [],
    },
    assetPrefix: NODE_ENV === 'production' ? '../out' : '',
};

module.exports = nextConfig;
