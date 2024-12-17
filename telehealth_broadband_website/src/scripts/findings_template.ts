/**
 * Script file to be shared across all state-specific findings pages.
 */

function attachModals() {
  const stateFindingsContainer = document.getElementById('state-findings')!;
  const children = Array.from(stateFindingsContainer.children);
  children.forEach(button => {
    const modal = document.getElementById((button as HTMLButtonElement).dataset.modalId!);
    if(modal) {
      button.addEventListener('click', () => {
        modal.dataset.isOpen = 'true';
      });
    }
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
