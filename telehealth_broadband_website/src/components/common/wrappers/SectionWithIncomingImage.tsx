import {type ReactElement, useEffect, useRef, useState} from "react";
import styles from './styles/section_with_upcoming_image.module.css';

interface SectionWithIncomingImageProps {
  contentIds: string[];
  imageSrcs: string[];
  children: ReactElement;
  highSensitivity?: boolean;
}

export default function SectionWithIncomingImage({contentIds, imageSrcs, highSensitivity, children}: SectionWithIncomingImageProps) {
  
  const sectionRef = useRef<HTMLElement>(null);
  const [currentSectionInView, setCurrentSectionInView] = useState<number>(0);
  
  useEffect(() => {
    contentIds.forEach((contentId: string, index: number) => {
      const intersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          let opacity = 1;
          if (window.innerWidth > 768) {
            (entry.target as HTMLElement).dataset.intersectionRatio = `${entry.intersectionRatio}`;
            opacity = Math.max(0.3, entry.intersectionRatio);
            const opacityRef = highSensitivity ? 0.8 : 0.45;
            if(opacity >= opacityRef) {
              setCurrentSectionInView(index);
            }
          }
        });
      }, {
        rootMargin: '-120px',
        threshold: Array.from({length: 101}, (_, i) => i / 100)
      });
      intersectionObserver.observe(document.getElementById(contentId)!);
    });
  }, []);
  
  useEffect(() => {
    const elements = contentIds.map((contentId: string) => document.getElementById(contentId)!);
    if (window.innerWidth <= 768) {
      elements.forEach((element: HTMLElement) => {
        element.style.opacity = '1';
      });
      return;
    }
    let highestRatio = Number(elements[0].dataset.intersectionRatio);
    let highestIndex = 0;
    elements.forEach((element: HTMLElement, index: number) => {
      if (Number(element.dataset.intersectionRatio) > highestRatio) {
        highestRatio = Number(element.dataset.intersectionRatio);
        highestIndex = index;
      }
    });
    setCurrentSectionInView(highestIndex);
    elements.forEach((element: HTMLElement, index: number) => {
      if(index === highestIndex) {
        element.style.opacity = '1';
      } else {
        element.style.opacity = '0.3';
      }
    });
  }, [currentSectionInView]);
  
  return (
    <section className={styles.sectionWithImage} ref={sectionRef}>
      {children}
      {imageSrcs.map((src, index) => (
        <img src={src}
              alt="section image"
              className={styles.incomingImage}
              data-visible={index === currentSectionInView}
              key={src}
        />
      ))}
    </section>
  );
}