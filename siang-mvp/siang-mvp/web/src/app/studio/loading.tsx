import Spinner from "@/components/Spinner";
import st from "@/components/Studio.module.css";

// Shown while the Studio loads the artist's page from Supabase.
export default function StudioLoading() {
  return (
    <main className={st.page}>
      <div className={st.column}>
        <div className={st.body}>
          <div className={st.skeletonCard} />
          <p className={st.loadingText}>
            <Spinner /> Opening your page…
          </p>
        </div>
      </div>
    </main>
  );
}
