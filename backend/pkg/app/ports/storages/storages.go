package storages

import "github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"

// IngestorAppStorage holds the storages needed by the Ingestor application
type IngestorAppStorages struct {
	GeospaceStorage    GeospaceStorage
	ASNOrgStorage      ASNOrgStorage
	MeasurementStorage MeasurementStorage
	SummariesStorage   SummariesStorage
}

func (i *IngestorAppStorages) OpenAll() error {
	if err := i.GeospaceStorage.Open(); err != nil {
		return err
	}
	if err := i.ASNOrgStorage.Open(); err != nil {
		return err
	}
	if err := i.MeasurementStorage.Open(); err != nil {
		return err
	}
	if err := i.SummariesStorage.Open(); err != nil {
		return err
	}
	return nil
}

func (i *IngestorAppStorages) CloseAll() error {
	if err := i.GeospaceStorage.Close(); err != nil {
		return err
	}
	if err := i.ASNOrgStorage.Close(); err != nil {
		return err
	}
	if err := i.MeasurementStorage.Close(); err != nil {
		return err
	}
	if err := i.SummariesStorage.Close(); err != nil {
		return err
	}
	return nil
}

func (i *IngestorAppStorages) Summarize() error {
	if err := i.MeasurementStorage.Close(); err != nil {
		return errors.Wrap(err, "storages.IngestorAppStorages#Summarize Close")
	}
	if err := i.SummariesStorage.Summarize(); err != nil {
		return errors.Wrap(err, "storages.IngestorAppStorages#Summarize Summarize")
	}
	return nil
}

// MappingStorages holds the storages needed by the Broadband Mapping application
type MappingAppStorages struct {
	GeospacesStorage GeospaceStorage
	ASNOrgsStorage   ASNOrgStorage
	SummariesStorage SummariesStorage
}

func (m *MappingAppStorages) OpenAll() error {
	if err := m.GeospacesStorage.Open(); err != nil {
		return err
	}
	if err := m.ASNOrgsStorage.Open(); err != nil {
		return err
	}
	if err := m.SummariesStorage.Open(); err != nil {
		return err
	}
	return nil
}

func (m *MappingAppStorages) CloseAll() error {
	if err := m.GeospacesStorage.Close(); err != nil {
		return err
	}
	if err := m.ASNOrgsStorage.Close(); err != nil {
		return err
	}
	if err := m.SummariesStorage.Close(); err != nil {
		return err
	}
	return nil
}
