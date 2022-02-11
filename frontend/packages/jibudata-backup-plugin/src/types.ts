import {
  //K8sResourceKind,
  K8sResourceCommon,
} from '@console/internal/module/k8s';

// BackupPolicy defines the policy for backup
type BackupPolicy = {
	name?:   string;
	repeat?: boolean; 
	// Cron job like frequency
	// Refer to https://en.wikipedia.org/wiki/Cron for format
	//
	// Predefined schedules:
	// Entry                  | Description                                | Equivalent To
	// -----                  | -----------                                | -------------
	// @yearly (or @annually) | Run once a year, midnight, Jan. 1st        | 0 0 1 1 *
	// @monthly               | Run once a month, midnight, first of month | 0 0 1 * *
	// @weekly                | Run once a week, midnight between Sat/Sun  | 0 0 * * 0
	// @daily (or @midnight)  | Run once a day, midnight                   | 0 0 * * *
	// @hourly                | Run once an hour, beginning of hour        | 0 * * * *
	//
	// Intervals:
	// @every <duration>
	// example: "@every 2h" means a schedule that activates every 2 hours since backup plan added
	frequency?:            string;       // `json:"frequency,omitempty"`
	retention?:           any;// `json:"retention,omitempty"`
	pause?:              boolean;         // `json:"pause,omitempty"`
	snapshotKeptMaxCount?: number;          // `json:"snapshotKeptMaxCount,omitempty"`
	copyMethod?:           string;       // `json:"copyMethod,omitempty"`
};

type DataExportPolicy = {
	exportData?: boolean;   //`json:"exportData,omitempty"`
	exportType?: string; //`json:"exportType,omitempty"`
	// hours
	exportFrequency?: number;          // `json:"exportFrequency,omitempty"`
	exportRetention?: any; // `json:"exportRetention,omitempty"`
	exportTimes?:     string[];    // `json:"exportTimes,omitempty"`
};

// BackupSpec defines the desired state of Backup
type BackupSpec = {
	persistentVolumes?: any //`json:",inline"`
	namespaces?:        string[];              //`json:"namespaces,omitempty"`
	srcClusterRef?:     any //`json:"srcClusterRef,omitempty"`
	migStorageRef?:     any //`json:"migStorageRef,omitempty"`
	hooks?:             any      //`json:"hooks,omitempty"`
	closed?:          boolean                 //`json:"closed,omitempty"`
	policy?:           BackupPolicy          //`json:"policy,omitempty"`
	exportPolicy?:     DataExportPolicy      //`json:"exportPolicy,omitempty"`
	includedResources?: string[]             //`json:"includedResources,omitempty"`
	excludedResources?: string[]            //`json:"excludedResources,omitempty"`
};

// BackupStatus defines the observed state of Backup
type BackupStatus = {
	unhealthyResources?: any //`json:",inline"`
	conditions?: any         //`json:",inline"`
	incompatible?: any       //`json:",inline"`
	observedDigest?:     string       //`json:"observedDigest,omitempty"`
	addedTimestamp?:    any //`json:"addedTimestamp,omitempty"`
	nextBackupTime?:     any //`json:"nextBackupTime,omitempty"`
	currentJobName?:     string       ////`json:"currentJobName,omitempty"`
	state?:              string       //`json:"state,omitempty"`
	nextExportTime?:     any //`json:"nextExportTime,omitempty"`
};

export type BackupKind = K8sResourceCommon & {
    spec: BackupSpec
    status?: BackupStatus
};

// BackupJobSpec defines the desired state of BackupJob
type BackupJobSpec = {
	backupRef?:       any //`json:"backupRef,omitempty"`
	stage?:           boolean                 //`json:"stage"`
	quiescePods?:     boolean                  //`json:"quiescePods,omitempty"`
	keepAnnotations?: boolean                  //`json:"keepAnnotations,omitempty"`
	verify?:          boolean                  //`json:"verify,omitempty"`
	canceled?:        boolean                  //`json:"canceled,omitempty"`
	inactivated?:     boolean                  //`json:"inactivated,omitempty"`
	repeat?:          boolean                  //`json:"repeat,omitempty"`
	exportData?:      boolean                  //`json:"exportData,omitempty"`
}

type ExportResult = {
	DataExportRef?: any //`json:"DataExportRef,omitempty"`
	ExportStatus?:  string                  //`json:"ExportStatus,omitempty"`
}

// BackupJobStatus defines the observed state of BackupJob
type BackupJobStatus = {
	conditions?:     any    //`json:",inline"`
	unhealthyResources?: any //`json:",inline"`
	submitTimestamp?:    any        //`json:"submitTimestamp,omitempty"`
	startTimestamp?:     any        //`json:"startTimestamp,omitempty"`
	stopTimestamp?:      any       //`json:"stopTimestamp,omitempty"`
	observedDigest?:     string              //`json:"observedDigest,omitempty"`
	phase?:              string              //`json:"phase,omitempty"`
	itinerary?:          string              //`json:"itinerary,omitempty"`
	errors?:             string[]            //`json:"errors,omitempty"`
	totalItems?:         number                 //`json:"totalItems,omitempty"`
	backedUpItems?:      number                 //`json:"backedUpItems,omitempty"`
	details?:            any //`json:"details,omitempty"`
	exportResult?:       ExportResult        //`json:"exportResult,omitempty"`
}

// +kubebuilder:object:root=true
// BackupJob is the Schema for the backupjobs API
export type BackupJobKind = K8sResourceCommon & {
	spec:   BackupJobSpec   //`json:"spec,omitempty"`
	status?: BackupJobStatus //`json:"status,omitempty"`
}

