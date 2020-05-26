/// <reference types="../@types/gce-images"/>

import type { Image, ImagesMap } from 'gce-images';
import { GCEImages } from 'gce-images';
import { isObject } from 'util';

const images = new GCEImages();

const isImagesMap = (
  imagesInfo: Image[] | ImagesMap,
): imagesInfo is ImagesMap => {
  return isObject(imagesInfo);
};

/**
 * List images
 * TODO: カスタムイメージも含めたほうが良いかもしれない
 */
export const listImages = async (): Promise<
  { project: string; family: string }[]
> => {
  const imagesInfo = await images.getAll();
  if (!isImagesMap(imagesInfo)) return [];
  const simpleImages = Object.keys(imagesInfo)
    .map((os) => {
      return imagesInfo[os]
        .map(({ family, selfLink }) => {
          const project = /(?<=projects\/)(?<project>[\w-]+)(?=\/)/.exec(
            selfLink,
          )?.groups?.project;
          if (!project) return undefined;
          return { project, family };
        })
        .filter((x): x is { project: string; family: string } => Boolean(x));
    })
    .flat();
  return simpleImages;
};
