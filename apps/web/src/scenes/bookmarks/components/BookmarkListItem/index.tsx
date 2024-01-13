import React, { useCallback, MouseEvent } from "react";
import Button from "ui/Button";

import { useDeleteBookmark } from "src/services/api/bookmarks";
import { Recommendation } from "src/services/types";

import styles from "./BookmarkListItem.module.css";
import { TrashIcon } from "@radix-ui/react-icons";

type BookmarkListItemProps = {
  bookmark: Recommendation;
  onDelete: () => void;
};
function BookmarkListItem({ bookmark, onDelete }: BookmarkListItemProps) {
  const { id, image, title, siteName, url } = bookmark;
  const mutation = useDeleteBookmark();
  const { isLoading } = mutation;

  const onDeleteClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      await mutation.mutateAsync(id);
      onDelete();
    },
    [id, mutation, onDelete],
  );

  return (
    <li className={styles["list-item"]}>
      <figure className="h-[150px] md:h-[100%] md:w-[200px] flex justify-center overflow-hidden rounded-t-md md:rounded-t-none md:rounded-l">
        {/* To support all possible og images, we aren't using Next Image */}
        {/* eslint-disable-next-line */}
        <img alt={title} src={image} className="object-cover min-w-full" />
      </figure>
      <div className="flex-1 flex flex-col px-4 pt-4 pb-2 bg-white rounded-b-md md:rounded-b-none md:rounded-r-md">
        <h2 className="flex flex-col min-w-full">
          <span className="text-primary text-lg md:text-xl md:justify-start md:flex-1">
            {title ?? siteName}
          </span>
          {title && (
            <a
              className="flex text-xs text-blue-300"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              {siteName} 🔗
            </a>
          )}
        </h2>
        <p className="flex-1" />
        <div className="flex justify-end items-end">
          <Button
            isLoading={isLoading}
            className="btn btn-ghost"
            onClick={onDeleteClick}
          >
            {!isLoading && <TrashIcon className="text-red-700" />}
          </Button>
        </div>
      </div>
    </li>
  );
}

export default React.memo(BookmarkListItem);
