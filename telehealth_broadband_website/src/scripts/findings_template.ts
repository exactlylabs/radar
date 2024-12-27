/**
 * Script file to be shared across all state-specific findings pages.
 */
function updateButtons(nextIndex: number, elementCount: number, nextButton: HTMLButtonElement, previousButton: HTMLButtonElement, dots: NodeListOf<HTMLButtonElement>, counter: HTMLDivElement) {
  if(nextIndex === elementCount - 1) {
    nextButton.setAttribute('disabled', 'true');
  } else {
    nextButton.removeAttribute('disabled');
  }
  
  if(nextIndex === 0) {
    previousButton.setAttribute('disabled', 'true');
  } else {
    previousButton.removeAttribute('disabled');
  }
  
  dots.forEach((dot, index) => {
    dot.setAttribute('data-selected', (index === nextIndex).toString());
  });
  
  counter.textContent = `${nextIndex + 1} of ${elementCount}`;
}

function attachModals() {
  const stateFindingsContainer = document.getElementById('state-findings')!;
  const children = Array.from(stateFindingsContainer.children);
  const modal = document.getElementById((children[0] as HTMLButtonElement).dataset.modalId!)!;
  children.forEach(button => {
    button.addEventListener('click', () => {
      const indexToShow = (button as HTMLButtonElement).dataset.modalIndex!;
      const container = modal.querySelector('[data-container="true"]')! as HTMLDivElement;
      const cards = container.querySelectorAll(`[data-index]`) as NodeListOf<HTMLDivElement>;
      container.dataset.currentIndex = indexToShow;
      cards.forEach(c => c.style.left = `-${parseInt(indexToShow) * 100}%`);
      updateButtons(
        parseInt(indexToShow),
        cards.length,
        modal.querySelector('button[data-type="next"]') as HTMLButtonElement,
        modal.querySelector('button[data-type="prev"]') as HTMLButtonElement,
        modal.querySelectorAll('button[data-type="dot"]') as NodeListOf<HTMLButtonElement>,
        modal.querySelector('div[data-type="counter"]') as HTMLDivElement
      );
      modal.dataset.isOpen = 'true';
    });
  });
}

function handleHorizontalShiftImages() {
  const horizontalShiftImageContainer = document.getElementById("horizontal-shift-image")!;
  if(!horizontalShiftImageContainer) return;
  const horizontalShiftImage = horizontalShiftImageContainer.querySelector('img')!;
  const {top: horizontalShiftTop} = horizontalShiftImage.getBoundingClientRect();
  const targetShiftPx = -100;
  if (horizontalShiftTop <= window.innerHeight) {
    const topPercentage = horizontalShiftTop / window.innerHeight;
    const newValue = targetShiftPx * (1 - topPercentage);
    horizontalShiftImage.style.marginLeft = `${newValue}px`;
  }
}

attachModals();
window.addEventListener('scroll', handleHorizontalShiftImages);
