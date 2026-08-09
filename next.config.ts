import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [process.env.LOCAL_IP ?? "localhost"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.youtube.com" }],
  },
  // 예전 배포에 나갔다가 slug 가 정리된 글들. Search Console 에 404 로 남아 있어서
  // 정식 주소로 넘긴다.
  async redirects() {
    return [
      {
        source: "/posts/use-deferred-value-vs-debounce-20260606-004144",
        destination: "/posts/use-deferred-value-vs-debounce",
        permanent: true,
      },
      {
        source: "/posts/useeffect-fetch-race-condition-20260527-backup",
        destination: "/posts/useeffect-fetch-race-condition",
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};

class VeliteWebpackPlugin {
  static started = false;
  apply(compiler: {
    hooks: { beforeCompile: { tapPromise: (name: string, fn: () => Promise<void>) => void } };
  }) {
    compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const dev = compiler.constructor.name === "Compiler";
      const { build } = await import("velite");
      await build({ watch: dev, clean: !dev });
    });
  }
}

export default nextConfig;
