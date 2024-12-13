import styles from "./PhotoList.module.css";
import { QueryErrorResetBoundary, useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { getMediaDetail, getMediaIds } from "../../api/instagram";
import { Suspense } from "react";
import Bat from "../loading/bat/Bat";
import { MdErrorOutline } from "react-icons/md";
import { ErrorBoundary } from "react-error-boundary";

function Photos() {
  const { data } = useSuspenseQuery({ queryFn: getMediaIds, queryKey: ["instagram-photos"] });
  const instagramIds = data.map(({ id }) => id);

  const { photos } = useSuspenseQueries({
    queries: instagramIds.slice(0, 20).map((instagramId) => ({
      queryKey: ["instagram-photo", instagramId],
      queryFn: () => getMediaDetail({ instagramId }),
      staleTime: Infinity,
    })),
    combine: (results) => ({
      photos: results.flatMap((result) => result.data).filter((v) => !!v),
      isPending: results.some((result) => result.isPending),
    }),
  });

  return (
    <>
      {photos.slice(0, 15).map(({ id, media_url }) => (
        <div key={id} className={styles["photo_wrapper"]}>
          <img src={media_url} className={styles.photo} />
        </div>
      ))}
    </>
  );
}

export default function PhotoList() {
  return (
    <div className={styles.photoPartList}>
      <h2>Photos</h2>

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary, error }) => (
              <div className={styles["error_fallback"]}>
                <MdErrorOutline size={80} />

                <div>{error.message}</div>
                <button onClick={() => resetErrorBoundary()}>다시 시도하기</button>
              </div>
            )}
          >
            <Suspense
              fallback={
                <div className={styles["bat_container"]}>
                  <Bat />
                </div>
              }
            >
              <div className={styles["photos_container"]}>
                <Photos />
              </div>
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  );
}
