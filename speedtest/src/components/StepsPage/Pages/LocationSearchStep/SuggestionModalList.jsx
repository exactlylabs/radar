import SuggestionModalRow from "./SuggestionModalRow";

const SuggestionModalList = ({
  suggestions,
  selectSuggestion,
  selectedSuggestionIndex,
}) => {
  return (
    <div>
      {
        suggestions.map((suggestion, index) => (
          <SuggestionModalRow key={suggestion.address}
                              suggestion={suggestion}
                              selectSuggestion={() => selectSuggestion(index)}
                              selected={index === selectedSuggestionIndex}
          />
        ))
      }
    </div>
  )
}

export default SuggestionModalList;