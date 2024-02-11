import * as React from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

import computeRowsLayout from "../../layouts/rows";
import PhotoRenderer from "../renderers/PhotoRenderer";
import RowContainerRenderer from "../renderers/RowContainerRenderer";
import { ComponentsProps, Photo, RenderPhoto, RenderRowContainer, RowsLayoutOptions } from "../../types";

export type RowsLayoutProps<T extends Photo = Photo> = {
  photos: T[];
  layoutOptions: RowsLayoutOptions<T>;
  renderPhoto?: RenderPhoto<T>;
  renderRowContainer?: RenderRowContainer<T>;
  componentsProps: ComponentsProps;
};

export default function RowsLayout<T extends Photo = Photo>(props: RowsLayoutProps<T>) {
  const {
    photos,
    layoutOptions,
    renderPhoto,
    renderRowContainer,
    componentsProps: { imageProps, rowContainerProps },
  } = props;
  const rowsLayout = React.useMemo(() => computeRowsLayout({ photos, layoutOptions }), [photos, layoutOptions]);
  const listRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  const virtualizer = useWindowVirtualizer({
    count: rowsLayout?.length ?? 0,
    estimateSize: (index) =>
      rowsLayout ? (rowsLayout[index][0]?.layout.height || 0) + (layoutOptions.spacing || 0) : 0,
    overscan: 5,
    scrollMargin: listRef?.current?.offsetTop ?? 0,
  });

  React.useLayoutEffect(() => virtualizer.measure(), [rowsLayout, virtualizer]);

  if (!rowsLayout) return null;

  return (
    <div ref={listRef}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((item) => {
          return (
            <RowContainerRenderer
              // eslint-disable-next-line react/no-array-index-key
              layoutOptions={layoutOptions}
              rowIndex={item.index}
              rowsCount={rowsLayout.length}
              renderRowContainer={renderRowContainer}
              // data-index={item.index}
              key={item.key}
              rowContainerProps={{
                ...rowContainerProps,
                style: {
                  ...rowContainerProps?.style,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${item.size}px`,
                  transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
                },
              }}
            >
              {rowsLayout[item.index].map(({ photo, layout }) => (
                <PhotoRenderer
                  key={photo.key || photo.src}
                  photo={photo}
                  layout={layout}
                  layoutOptions={layoutOptions}
                  renderPhoto={renderPhoto}
                  imageProps={imageProps}
                />
              ))}
            </RowContainerRenderer>
            // </div>
          );
        })}
      </div>
    </div>
  );
}
// {rowsLayout.map((row, rowIndex) => (
//   <RowContainerRenderer
//     // eslint-disable-next-line react/no-array-index-key
//     key={`row-${rowIndex}`}
//     layoutOptions={layoutOptions}
//     rowIndex={rowIndex}
//     rowsCount={rowsLayout.length}
//     renderRowContainer={renderRowContainer}
//     rowContainerProps={rowContainerProps}
//   >
//     {row.map(({ photo, layout }) => (
//       <PhotoRenderer
//         key={photo.key || photo.src}
//         photo={photo}
//         layout={layout}
//         layoutOptions={layoutOptions}
//         renderPhoto={renderPhoto}
//         imageProps={imageProps}
//       />
//     ))}
//   </RowContainerRenderer>
// ))}
