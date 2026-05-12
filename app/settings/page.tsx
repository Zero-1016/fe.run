import type { Metadata } from "next";
import pkg from "@/package.json";
import { siteConfig, SITE_URL } from "@/lib/site";
import { SettingsSection } from "@/components/settings/section";
import { OfflineSection } from "@/components/settings/offline-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { SubscribeSection } from "@/components/settings/subscribe-section";
import { AboutSection } from "@/components/settings/about-section";

export const metadata: Metadata = {
  title: "설정",
  robots: { index: false, follow: false },
};

const GITHUB_URL = "https://github.com/Zero-1016/tech-blog";

export default function SettingsPage() {
  const feedUrl = `${SITE_URL}/feed.xml`;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-6 md:py-16">
      <header className="mb-10 md:mb-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary md:text-[11px]">
          Settings
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">설정</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary">
          오프라인 저장, 테마, 구독 같은 개인 환경을 관리해요. 모든 설정은 이 브라우저에만 저장돼요.
        </p>
      </header>

      <div className="flex flex-col gap-8 md:gap-14">
        <SettingsSection
          label="01 / Offline"
          title="오프라인 저장"
          description="비행기·지하철처럼 인터넷이 끊기는 상황을 위해 글을 미리 저장해 두세요."
        >
          <OfflineSection />
        </SettingsSection>

        <Divider />

        <SettingsSection
          label="02 / Appearance"
          title="외관"
          description="테마를 시스템에 맞추거나 라이트·다크로 고정할 수 있어요."
        >
          <AppearanceSection />
        </SettingsSection>

        <Divider />

        <SettingsSection
          label="03 / Subscribe"
          title="구독"
          description="RSS 리더에 추가하거나 GitHub에서 코드를 확인하세요."
        >
          <SubscribeSection feedUrl={feedUrl} githubUrl={GITHUB_URL} />
        </SettingsSection>

        <Divider />

        <SettingsSection
          label="04 / About"
          title="정보"
          description="이 사이트의 빌드 상태와 메타 정보."
        >
          <AboutSection
            version={pkg.version}
            siteName={siteConfig.name}
            author={siteConfig.author}
            githubUrl={GITHUB_URL}
          />
        </SettingsSection>
      </div>
    </main>
  );
}

function Divider() {
  return <hr className="border-t border-dashed border-border md:hidden" />;
}
