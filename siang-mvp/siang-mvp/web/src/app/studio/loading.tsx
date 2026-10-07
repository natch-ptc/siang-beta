import Spinner from "@/components/Spinner";
import app from "@/components/app.module.css";
import st from "@/components/Studio.module.css";

// Shown while the Studio loads the artist's page from Supabase.
export default function StudioLoading() {
  return (
    <main className={`${app.app} ${app.appBare}`}>
      <div className={st.skeleton} />
      <p className={st.loadingText}>
        <Spinner /> Opening your studio…
      </p>
    </main>
  );
}
