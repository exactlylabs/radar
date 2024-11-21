import {type ReactElement, useEffect, useRef, useState} from "react";
import styles from './section_with_upcoming_image.module.css';

interface SectionWithIncomingImageProps {
  contentIds: string[];
  imageSrcs: string[];
  children: ReactElement;
}

export default function SectionWithIncomingImage({contentIds, imageSrcs, children}: SectionWithIncomingImageProps) {
  
  const sectionRef = useRef<HTMLElement>(null);
  const [currentSectionInView, setCurrentSectionInView] = useState<number>(0);
  
  useEffect(() => {
    contentIds.forEach((contentId: string, index: number) => {
      const intersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          let opacity = 1;
          if (window.innerWidth > 768) {
            opacity = Math.max(0.3, entry.intersectionRatio);
            if(opacity >= 0.45) {
              setCurrentSectionInView(index);
            }
          }
          (entry.target as HTMLElement).style.opacity = `${opacity}`;
        });
      }, {
        rootMargin: '-120px',
        threshold: Array.from({length: 101}, (_, i) => i / 100)
      });
      intersectionObserver.observe(document.getElementById(contentId)!);
    });
  }, []);
  
  return (
    <section className={styles.sectionWithImage} ref={sectionRef}>
      {children}
      {imageSrcs.map((src, index) => (
        <img src={src}
              alt="section image"
              className={styles.incomingImage}
              data-visible={index === currentSectionInView}
              data-image-index={index}
              key={src}
        />
      ))}
    </section>
  );
}