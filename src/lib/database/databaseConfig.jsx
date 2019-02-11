import cockpit from "cockpit";
import React from "react";
import CustomCollapse from "../customCollapse.jsx";
import { log_cmd } from "../tools.jsx";
import {
    Spinner,
    noop
} from "patternfly-react";
import PropTypes from "prop-types";
import "../../css/ds.css";

export class GlobalDatabaseConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            db_cache_auto: this.props.data.db_cache_auto,
            import_cache_auto: this.props.data.import_cache_auto,
            looklimit: this.props.data.looklimit,
            idscanlimit: this.props.data.idscanlimit,
            pagelooklimit: this.props.data.pagelooklimit,
            pagescanlimit: this.props.data.pagescanlimit,
            rangelooklimit: this.props.data.rangelooklimit,
            autosize: this.props.data.autosize,
            autosizesplit: this.props.data.autosizesplit,
            dbcachesize: this.props.data.dbcachesize,
            txnlogdir: this.props.data.txnlogdir,
            dbhomedir: this.props.data.dbhomedir,
            dblocks: this.props.data.dblocks,
            chxpoint: this.props.data.chxpoint,
            compactinterval: this.props.data.compactinterval,
            importcachesize: this.props.data.importcachesize,
            importcacheauto: this.props.data.importcacheauto,
            // These variables store the original value (used for saving config)
            _looklimit: this.props.data.looklimit,
            _idscanlimit: this.props.data.idscanlimit,
            _pagelooklimit: this.props.data.pagelooklimit,
            _pagescanlimit: this.props.data.pagescanlimit,
            _rangelooklimit: this.props.data.rangelooklimit,
            _autosize: this.props.data.autosize,
            _autosizesplit: this.props.data.autosizesplit,
            _dbcachesize: this.props.data.dbcachesize,
            _txnlogdir: this.props.data.txnlogdir,
            _dbhomedir: this.props.data.dbhomedir,
            _dblocks: this.props.data.dblocks,
            _chxpoint: this.props.data.chxpoint,
            _compactinterval: this.props.data.compactinterval,
            _importcachesize: this.props.data.importcachesize,
            _importcacheauto: this.props.data.importcacheauto,
            _db_cache_auto: this.props.data.db_cache_auto,
            _import_cache_auto: this.props.data.import_cache_auto,
        };
        this.handleChange = this.handleChange.bind(this);
        this.select_auto_cache = this.select_auto_cache.bind(this);
        this.select_auto_import_cache = this.select_auto_import_cache.bind(this);
        this.save_db_config = this.save_db_config.bind(this);
    }

    select_auto_cache (e) {
        this.setState({
            db_cache_auto: !this.state.db_cache_auto
        }, this.handleChange(e));
    }

    select_auto_import_cache (e) {
        this.setState({
            import_cache_auto: !this.state.import_cache_auto
        }, this.handleChange(e));
    }

    handleChange(e) {
        // Generic
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({
            [e.target.id]: value
        });
    }

    save_db_config() {
        // Build up the command list
        let cmd = [
            'dsconf', '-j', 'ldapi://%2fvar%2frun%2fslapd-' + this.props.serverId + '.socket',
            'backend', 'config', 'set'
        ];
        let requireRestart = false;

        if (this.state._looklimit != this.state.looklimit) {
            cmd.push("--lookthroughlimit=" + this.state.looklimit);
        }
        if (this.state._idscanlimit != this.state.idscanlimit) {
            cmd.push("--idlistscanlimit=" + this.state.idscanlimit);
        }
        if (this.state._pagelooklimit != this.state.pagelooklimit) {
            cmd.push("--pagedlookthroughlimit=" + this.state.pagelooklimit);
        }
        if (this.state._pagescanlimit != this.state.pagescanlimit) {
            cmd.push("--pagedidlistscanlimit=" + this.state.pagescanlimit);
        }
        if (this.state._rangelooklimit != this.state.rangelooklimit) {
            cmd.push("--rangelookthroughlimit=" + this.state.rangelooklimit);
        }
        if (this.state.db_cache_auto) {
            // Auto cache is selected
            if (this.state._db_cache_auto != this.state.db_cache_auto) {
                // We just enabled auto cache,
                if (this.state.autosize == "0") {
                    cmd.push("--cache-autosize=10");
                } else {
                    cmd.push("--cache-autosize=" + this.state.autosize);
                }
                requireRestart = true;
            } else if (this.state._autosize != this.state.autosize) {
                // Update auto cache settings if it changed
                cmd.push("--cache-autosize=" + this.state.autosize);
                requireRestart = true;
            }
        } else {
            // No auto cache, check if we need to reset the value
            if (this.state._db_cache_auto != this.state.db_cache_auto) {
                // We just disabled auto cache
                cmd.push("--cache-autosize=0");
                requireRestart = true;
            }
        }
        if (this.state._autosizesplit != this.state.autosizesplit) {
            cmd.push("--cache-autosize-split=" + this.state.autosizesplit);
            requireRestart = true;
        }
        if (this.state._dbcachesize != this.state.dbcachesize) {
            cmd.push("--dbcachesize=" + this.state.dbcachesize);
            requireRestart = true;
        }
        if (this.state._txnlogdir != this.state.txnlogdir) {
            cmd.push("--logdirectory=" + this.state.txnlogdir);
            requireRestart = true;
        }
        if (this.state._dbhomedir != this.state.dbhomedir) {
            cmd.push("--db-home-directory=" + this.state.dbhomedir);
            requireRestart = true;
        }
        if (this.state._dblocks != this.state.dblocks) {
            cmd.push("--locks=" + this.state.dblocks);
            requireRestart = true;
        }
        if (this.state._chxpoint != this.state.chxpoint) {
            cmd.push("--checkpoint-interval=" + this.state.chxpoint);
            requireRestart = true;
        }
        if (this.state._compactinterval != this.state.compactinterval) {
            cmd.push("--compactdb-interval=" + this.state.compactinterval);
            requireRestart = true;
        }
        if (this.state.import_cache_auto) {
            // Auto cache is selected
            if (this.state._import_cache_auto != this.state.import_cache_auto) {
                // We just enabled auto cache,
                if (this.state.importcachesize == "0") {
                    cmd.push("--import-cache-autosize=-1");
                } else {
                    cmd.push("--import-cache-autosize=" + this.state.importcachesize);
                }
            } else if (this.state._importcachesize != this.state.importcachesize) {
                // Update auto cache settings if it changed
                cmd.push("--import-cache-autosize=" + this.state.importcachesize);
            }
        } else {
            // Auto cache is not selected, check if we need to reset the value
            if (this.state._import_cache_auto != this.state.import_cache_auto) {
                // We just disabled auto cache
                cmd.push("--import-cache-autosize=0");
            }
        }
        if (this.state._importcachesize != this.state.importcachesize) {
            cmd.push("--import-cachesize=" + this.state.importcachesize);
        }
        if (cmd.length > 6) {
            log_cmd("save_db_config", "Applying config change", cmd);
            let msg = "Successfully updated database configuration";
            if (requireRestart) {
                msg = ("Successfully updated database configuration.  These " +
                    "changes require the server to be restarted to take effect");
            }
            cockpit
                    .spawn(cmd, {superuser: true, "err": "message"})
                    .done(content => {
                        // Continue with the next mod
                        this.props.reload();
                        this.props.addNotification(
                            "success",
                            msg
                        );
                    })
                    .fail(err => {
                        this.props.reload();
                        this.props.addNotification(
                            "error",
                            `Error updating configuration - ${err}`
                        );
                    });
        }
    }

    render() {
        let db_cache_form;
        let import_cache_form;
        let db_auto_checked = false;
        let import_auto_checked = false;

        if (this.state.db_cache_auto) {
            db_cache_form = <div id="auto-cache-form" className="ds-margin-left">
                <div>
                    <label htmlFor="autosize" className="ds-config-label-xlrg"
                        title="Enable database and entry cache auto-tuning using a percentage of the systems current resources (nsslapd-cache-autosize).">
                        System Memory Percentage</label><input className="ds-input" type="text"
                        id="autosizee" size="10" onChange={this.handleChange}
                        value={this.state.autosize} />
                </div>
                <div>
                    <label htmlFor="autosizesplit" className="ds-config-label-xlrg"
                        title="Sets the percentage of memory that is used for the database cache. The remaining percentage is used for the entry cache (nsslapd-cache-autosize-split).">
                        DB Cache Percentage</label><input className="ds-input" type="text"
                        id="autosizesplit" size="10" onChange={this.handleChange}
                        value={this.state.autosizesplit} />
                </div>
            </div>;
            db_auto_checked = true;
        } else {
            db_cache_form = <div id="manual-cache-form" className="ds-margin-left">
                <label htmlFor="dbcachesize" className="ds-config-label-xlrg"
                    title="Specifies the database index cache size in bytes (nsslapd-dbcachesize).">
                    Database Cache Size (bytes)</label><input className="ds-input" type="text"
                    id="dbcachesize" size="10" onChange={this.handleChange} value={this.state.dbcachesize} />
            </div>;
            db_auto_checked = false;
        }

        if (this.state.import_cache_auto) {
            import_cache_form = <div id="auto-import-cache-form" className="ds-margin-left">
                <label htmlFor="importcacheauto" className="ds-config-label-xlrg"
                    title="Enter '-1' to use 50% of available memory, '0' to disable autotuning, or enter the percentage of available memory to use.  Value range -1 through 100, default is '-1' (nsslapd-import-cache-autosize).">
                    Import Cache Autosize</label><input className="ds-input" type="text"
                    id="importcacheauto" size="10"
                    onChange={this.handleChange} value={this.state.importcacheauto} />
            </div>;
            import_auto_checked = true;
        } else {
            import_cache_form = <div id="manual-import-cache-form" className="ds-margin-left">
                <label htmlFor="importcachesize" className="ds-config-label-xlrg"
                    title="The size of the database cache used in the bulk import process. (nsslapd-import-cachesize).">
                    Import Cache Size (bytes)</label><input className="ds-input" type="text" id="importcachesize"
                    size="10" onChange={this.handleChange} value={this.state.importcachesize} />
            </div>;
            import_auto_checked = false;
        }

        let spinner = "";
        if (this.state.loading) {
            spinner =
                <div className="ds-loading-spinner ds-center">
                    <p />
                    <h4>Loading global database configuration ...</h4>
                    <Spinner loading size="md" />
                </div>;
        }

        return (
            <div className="container-fluid" id="db-global-page">
                {spinner}
                <div className={this.state.loading ? 'ds-fadeout' : 'ds-fadein'}>
                    <h3 className="ds-config-header">Global Database Configuration</h3>
                    <hr />
                    <div className="ds-container">
                        <div className="ds-inline">
                            <div>
                                <label htmlFor="nsslapd-lookthrough-limit" className="ds-config-label"
                                    title="The maximum number of entries that the Directory Server will check when examining candidate entries in response to a search request (nsslapd-lookthrough-limit).">
                                    Database Look Though Limit</label><input id="looklimit" value={this.state.looklimit}
                                    onChange={this.handleChange} className="ds-input" type="text" size="15" />
                            </div>
                            <div>
                                <label htmlFor="nsslapd-idlistscanlimit" className="ds-config-label"
                                    title="The number of entry IDs that are searched during a search operation (nsslapd-idlistscanlimit).">
                                    ID List Scan Limit</label><input id="idscanlimit" value={this.state.idscanlimit}
                                    onChange={this.handleChange} className="ds-input" type="text"size="15" />
                            </div>
                        </div>
                        <div className="ds-divider" />
                        <div className="ds-inline">
                            <div>
                                <label htmlFor="nsslapd-pagedlookthroughlimit" className="ds-config-label"
                                    title="The maximum number of entries that the Directory Server will check when examining candidate entries for a search which uses the simple paged results control (nsslapd-pagedlookthroughlimit).">
                                    Paged Search Look Through Limit</label><input id="pagelooklimit" value={this.state.pagelooklimit}
                                    onChange={this.handleChange} className="ds-input" type="text" size="15" />
                            </div>
                            <div>
                                <label htmlFor="nsslapd-pagedidlistscanlimit" className="ds-config-label"
                                    title="The number of entry IDs that are searched, specifically, for a search operation using the simple paged results control (nsslapd-pagedidlistscanlimit).">
                                    Paged Search ID List Scan Limit</label><input id="pagescanlimit"
                                    value={this.state.pagescanlimit} onChange={this.handleChange}
                                    className="ds-input" type="text" size="15" />
                            </div>
                            <div>
                                <label htmlFor="nsslapd-rangelookthroughlimit" className="ds-config-label"
                                    title="The maximum number of entries that the Directory Server will check when examining candidate entries in response to a range search request (nsslapd-rangelookthroughlimit).">
                                    Range Search Look Through Limit</label><input id="rangelooklimit"
                                    value={this.state.rangelooklimit} onChange={this.handleChange}
                                    className="ds-input" type="text" size="15" />
                            </div>
                        </div>
                    </div>
                    <div className="ds-container">
                        <div>
                            <h4 className="ds-sub-header">Database Cache Settings</h4>
                            <hr />
                            <div>
                                <label htmlFor="autoCacheChkbox" title="Set Database/Entry to be set automatically"><input
                                    className="ds-left-indent" type="checkbox" id="autoCacheChkbox" checked={db_auto_checked}
                                    onChange={this.select_auto_cache} /> Automatic Cache Tuning</label>
                                {db_cache_form}
                            </div>
                        </div>
                        <div className="ds-divider-lrg" />
                        <div>
                            <h4 className="ds-sub-header">Import Cache Settings</h4>
                            <hr />
                            <div>
                                <label htmlFor="autoImportCacheChkbox"title="Set Database/Entry to be set automatically"><input
                                    className="ds-left-indent" type="checkbox" id="autoImportCacheChkbox"
                                    onChange={this.select_auto_import_cache}
                                    checked={import_auto_checked} /> Automatic Import Cache Tuning</label>
                                {import_cache_form}
                            </div>
                        </div>
                    </div>
                    <CustomCollapse>
                        <div className="ds-accordion-panel">
                            <div className="ds-container">
                                <div className="ds-inline">
                                    <div>
                                        <label htmlFor="nsslapd-db-logdirectory" className="ds-config-label"
                                            title="Database Transaction Log Location (nsslapd-db-logdirectory).">
                                            Transaction Logs Directory</label><input id="txnlogdir" value={this.state.txnlogdir}
                                            onChange={this.handleChange} className="ds-input" type="text" size="25" />
                                    </div>
                                    <div>
                                        <label htmlFor="nsslapd-db-home-directory" className="ds-config-label"
                                        title="Location for database memory mapped files.  You must specify a subdirectory of a tempfs type filesystem (nsslapd-db-home-directory).">
                                            Database Home Directory</label><input id="dbhomedir" value={this.state.dbhomedir}
                                            onChange={this.handleChange} className="ds-input" type="text" size="25" />
                                    </div>
                                    <div>
                                        <label htmlFor="nsslapd-db-locks" className="ds-config-label"
                                            title="The number of database locks (nsslapd-db-locks).">
                                            Database Locks</label><input id="dblocks" value={this.state.dblocks}
                                            onChange={this.handleChange} className="ds-input" type="text" size="25" />
                                    </div>
                                    <div>
                                        <label htmlFor="nsslapd-db-checkpoint-interval" className="ds-config-label"
                                            title="Amount of time in seconds after which the Directory Server sends a checkpoint entry to the database transaction log (nsslapd-db-checkpoint-interval).">
                                            Database Checkpoint Interval</label><input id="chxpoint" value={this.state.chxpoint}
                                            onChange={this.handleChange} className="ds-input" type="text" size="25" />
                                    </div>
                                    <div>
                                        <label htmlFor="nsslapd-db-compactdb-interval" className="ds-config-label"
                                            title="The interval in seconds when the database is compacted (nsslapd-db-compactdb-interval).">
                                            Database Compact Interval</label><input id="compactinterval" value={this.state.compactinterval}
                                            onChange={this.handleChange}className="ds-input" type="text" size="25" />
                                    </div>
                                </div>
                            </div>
                            <p />
                        </div>
                    </CustomCollapse>
                    <hr />
                    <div className="ds-save-btn">
                        <button className="btn btn-primary save-button"
                            onClick={this.save_db_config}>Save Configuration</button>
                    </div>
                </div>
            </div>
        );
    }
}

// Property types and defaults

GlobalDatabaseConfig.propTypes = {
    serverId: PropTypes.string,
    addNotification: PropTypes.func,
    data: PropTypes.object,
    reload: PropTypes.func,
};

GlobalDatabaseConfig.defaultProps = {
    serverId: "",
    addNotification: noop,
    data: {},
    reload: noop,
};
