package web100

import (
	"bytes"
	"errors"
)

type Snapshot struct {
	// Just the raw data, without BEGIN_SNAP_DATA.
	raw    []byte    // The raw data, NOT including the BEGIN_SNAP_HEADER
	fields *fieldSet // The fieldset describing the raw contents.
}

func (snap *Snapshot) reset(data []byte, fields *fieldSet) {
	snap.fields = fields
	snap.raw = data
}

// SnapshotValues writes all values into the provided Saver.
func (snap *Snapshot) SnapshotValues(snapValues Saver) error {
	if snap.raw == nil {
		return errors.New("Empty/Invalid Snaplog")
	}
	var field Variable
	for _, field = range snap.fields.Fields {
		// Interpret and save the web100 field value.
		field.Save(snap.raw[field.Offset:field.Offset+field.Size], snapValues)
	}
	return nil
}

// SnapshotDeltas writes changed values into the provided Saver.
func (snap *Snapshot) SnapshotDeltas(other *Snapshot, snapValues Saver) error {
	if snap.raw == nil {
		return errors.New("Empty/Invalid Snaplog")
	}
	if other.raw == nil {
		// If other is empty, return full snapshot
		return snap.SnapshotValues(snapValues)
	}
	var field Variable
	for _, field = range snap.fields.Fields {
		a := other.raw[field.Offset : field.Offset+field.Size]
		b := snap.raw[field.Offset : field.Offset+field.Size]
		if !bytes.Equal(a, b) {
			// Interpret and save the web100 field value.
			field.Save(b, snapValues)
		}
	}
	return nil
}

// about 40 nsec per field.
func (sl *SnapLog) SliceIntField(fieldName string, indices []int) []int64 {
	var s Snapshot // This saves about 2 usec, compared with creating new Snapshot for each row.
	field := sl.read.find(fieldName)
	result := NewIntArraySaver(len(indices))
	for i := 0; i < len(indices); i++ {
		// Safe to skip the validation, because it was done when getting the indices.
		offset := sl.bodyOffset + indices[i]*sl.read.Length
		s.reset(sl.raw[offset+len(BEGIN_SNAP_DATA):offset+sl.read.Length], &sl.read)

		field.Save(s.raw[field.Offset:field.Offset+field.Size], &result)
	}
	return result.Integers
}

type IntArraySaver struct {
	Integers []int64
}

func NewIntArraySaver(n int) IntArraySaver {
	return IntArraySaver{make([]int64, 0, n)}
}

func (s *IntArraySaver) SetInt64(name string, val int64) {
	s.Integers = append(s.Integers, val)
}
func (s *IntArraySaver) SetBool(name string, val bool)     {}
func (s *IntArraySaver) SetString(name string, val string) {}
