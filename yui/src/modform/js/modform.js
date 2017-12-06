// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/** global: M */
/** global: Y */

M.mod_bigbluebuttonbn = M.mod_bigbluebuttonbn || {};

M.mod_bigbluebuttonbn.modform = {

    bigbluebuttonbn: {},
    strings: {},

    /**
     * Initialise the broker code.
     *
     * @method init
     * @param {object} bigbluebuttonbn
     */
    init: function(bigbluebuttonbn) {
        this.bigbluebuttonbn = bigbluebuttonbn;
        this.strings = {
            as: M.util.get_string('mod_form_field_participant_list_text_as', 'bigbluebuttonbn'),
            viewer: M.util.get_string('mod_form_field_participant_bbb_role_viewer', 'bigbluebuttonbn'),
            moderator: M.util.get_string('mod_form_field_participant_bbb_role_moderator', 'bigbluebuttonbn'),
            remove: M.util.get_string('mod_form_field_participant_list_action_remove', 'bigbluebuttonbn')
        };
        this.updateInstanceTypeProfile();
        this.participantListInit();
    },

    updateInstanceTypeProfile: function() {
        var selectedType, profileType;
        selectedType = Y.one('#id_type');
        profileType = this.bigbluebuttonbn.instance_type_room_only;
        if (selectedType !== null) {
            profileType = selectedType.get('value');
        }
        this.applyInstanceTypeProfile(this.bigbluebuttonbn.instance_type_profiles[profileType]);
    },

    applyInstanceTypeProfile: function(instanceTypeProfile) {
        var features = instanceTypeProfile.features;
        var showAll = features.includes('all');
        // Show room settings validation.
        this.showFieldset('id_room', showAll || features.includes('showroom'));
        // Show recordings settings validation.
        this.showFieldset('id_recordings', showAll || features.includes('showrecordings'));
        // Show recordings imported settings validation.
        this.showInput('id_recordings_imported', showAll || features.includes('showrecordings'));
        // Preuploadpresentation feature validation.
        this.showFieldset('id_preuploadpresentation', showAll || features.includes('preuploadpresentation'));
        // Participants feature validation.
        this.showFieldset('id_permissions', showAll || features.includes('permissions'));
        // Schedule feature validation.
        this.showFieldset('id_schedule', showAll || features.includes('schedule'));
        // Common module settings validation.
        this.showFieldset('id_modstandardelshdr', showAll || features.includes('modstandardelshdr'));
        // Restrict access validation.
        this.showFieldset('id_availabilityconditionsheader', showAll || features.includes('availabilityconditionsheader'));
        // Tags validation.
        this.showFieldset('id_tagshdr', showAll || features.includes('tagshdr'));
        // Competencies validation.
        this.showFieldset('id_competenciessection', showAll || features.includes('competenciessection'));
    },

    showFieldset: function(id, show) {
        // Show room settings validation.
        var fieldset = Y.DOM.byId(id);
        if (!fieldset) {
            return;
        }
        if (show) {
            Y.DOM.setStyle(fieldset, 'display', 'block');
            return;
        }
        Y.DOM.setStyle(fieldset, 'display', 'none');
    },

    showInput: function(id, show) {
        // Show room settings validation.
        var inputset = Y.DOM.byId(id);
        if (!inputset) {
            return;
        }
        var node = Y.one(inputset).ancestor('div').ancestor('div');
        if (show) {
            node.setStyle('display', 'block');
            return;
        }
        node.setStyle('display', 'none');
    },

    participantSelectionSet: function() {
        this.selectClear('bigbluebuttonbn_participant_selection');
        var type = document.getElementById('bigbluebuttonbn_participant_selection_type');
        for (var i = 0; i < type.options.length; i++) {
            if (type.options[i].selected) {
                var options = this.bigbluebuttonbn.participant_data[type.options[i].value].children;
                for (var option in options) {
                    if (options.hasOwnProperty(option)) {
                        this.selectAddOption(
                            'bigbluebuttonbn_participant_selection', options[option].name, options[option].id
                        );
                    }
                }
                if (type.options[i].value === 'all') {
                    this.selectAddOption('bigbluebuttonbn_participant_selection',
                        '---------------', 'all');
                    this.selectDisable('bigbluebuttonbn_participant_selection');
                } else {
                    this.selectEnable('bigbluebuttonbn_participant_selection');
                }
            }
        }
    },

    participantListInit: function() {
        var selectionTypeValue, selectionValue, selectionRole, participantSelectionTypes;
        for (var i = 0; i < this.bigbluebuttonbn.participant_list.length; i++) {
            selectionTypeValue = this.bigbluebuttonbn.participant_list[i].selectiontype;
            selectionValue = this.bigbluebuttonbn.participant_list[i].selectionid;
            selectionRole = this.bigbluebuttonbn.participant_list[i].role;
            participantSelectionTypes = this.bigbluebuttonbn.participant_data[selectionTypeValue];
            if (selectionTypeValue != 'all' && typeof participantSelectionTypes.children[selectionValue] == 'undefined') {
                // Remove from memory.
                this.participantRemoveFromMemory(selectionTypeValue, selectionValue);
                continue;
            }
            // Add it to the form.
            this.participantAddToForm(selectionTypeValue, selectionValue, selectionRole);
        }
        // Update in the form.
        this.participantListUpdate();
    },

    participantListUpdate: function() {
        var participantList = document.getElementsByName('participants')[0];
        participantList.value = JSON.stringify(this.bigbluebuttonbn.participant_list).replace(/"/g, '&quot;');
    },

    participantRemove: function(selectionTypeValue, selectionValue) {
        // Remove from memory.
        this.participantRemoveFromMemory(selectionTypeValue, selectionValue);

        // Remove from the form.
        this.participantRemoveFromForm(selectionTypeValue, selectionValue);

        // Update in the form.
        this.participantListUpdate();
    },

    participantRemoveFromMemory: function(selectionTypeValue, selectionValue) {
        var selectionid = (selectionValue === '' ? null : selectionValue);
        for (var i = 0; i < this.bigbluebuttonbn.participant_list.length; i++) {
            if (this.bigbluebuttonbn.participant_list[i].selectiontype == selectionTypeValue &&
                this.bigbluebuttonbn.participant_list[i].selectionid == selectionid) {
                this.bigbluebuttonbn.participant_list.splice(i, 1);
            }
        }
    },

    participantRemoveFromForm: function(selectionTypeValue, selectionValue) {
        var id = 'participant_list_tr_' + selectionTypeValue + '-' + selectionValue;
        var participantListTable = document.getElementById('participant_list_table');
        for (var i = 0; i < participantListTable.rows.length; i++) {
            if (participantListTable.rows[i].id == id) {
                participantListTable.deleteRow(i);
            }
        }
    },

    participantAdd: function() {
        var selectionType = document.getElementById('bigbluebuttonbn_participant_selection_type');
        var selection = document.getElementById('bigbluebuttonbn_participant_selection');
        // Lookup to see if it has been added already.
        for (var i = 0; i < this.bigbluebuttonbn.participant_list.length; i++) {
            if (this.bigbluebuttonbn.participant_list[i].selectiontype == selectionType.value &&
                this.bigbluebuttonbn.participant_list[i].selectionid == selection.value) {
                return;
            }
        }
        // Add it to memory.
        this.participantAddToMemory(selectionType.value, selection.value);
        // Add it to the form.
        this.participantAddToForm(selectionType.value, selection.value, 'viewer');
        // Update in the form.
        this.participantListUpdate();
    },

    participantAddToMemory: function(selectionTypeValue, selectionValue) {
        this.bigbluebuttonbn.participant_list.push({
            "selectiontype": selectionTypeValue,
            "selectionid": selectionValue,
            "role": "viewer"
        });
    },

    participantAddToForm: function(selectionTypeValue, selectionValue, selectionRole) {
        var listTable, innerHTML, selectedHtml, removeHtml, removeClass, bbbRoles, i, row, cell0, cell1, cell2, cell3;
        listTable = document.getElementById('participant_list_table');
        row = listTable.insertRow(listTable.rows.length);
        row.id = "participant_list_tr_" + selectionTypeValue + "-" + selectionValue;
        cell0 = row.insertCell(0);
        cell0.width = "125px";
        cell0.innerHTML = '<b><i>' + this.bigbluebuttonbn.participant_data[selectionTypeValue].name;
        cell0.innerHTML += (selectionTypeValue !== 'all' ? ':&nbsp;' : '') + '</i></b>';
        cell1 = row.insertCell(1);
        cell1.innerHTML = '';
        if (selectionTypeValue !== 'all') {
            cell1.innerHTML = this.bigbluebuttonbn.participant_data[selectionTypeValue].children[selectionValue].name;
        }
        innerHTML = '&nbsp;<i>' + this.strings.as + '</i>&nbsp;';
        innerHTML += '<select id="participant_list_role_' + selectionTypeValue + '-' + selectionValue + '"';
        innerHTML += ' onchange="M.mod_bigbluebuttonbn.modform.participantListRoleUpdate(\'';
        innerHTML += selectionTypeValue + '\', \'' + selectionValue;
        innerHTML += '\'); return 0;" class="select custom-select">';
        bbbRoles = ['viewer', 'moderator'];
        for (i = 0; i < bbbRoles.length; i++) {
            selectedHtml = '';
            if (bbbRoles[i] === selectionRole) {
                selectedHtml = ' selected="selected"';
            }
            innerHTML += '<option value="' + bbbRoles[i] + '"' + selectedHtml + '>' + this.strings[bbbRoles[i]] + '</option>';
        }
        innerHTML += '</select>';
        cell2 = row.insertCell(2);
        cell2.innerHTML = innerHTML;
        cell3 = row.insertCell(3);
        cell3.width = "20px";
        removeHtml = this.strings.remove;
        removeClass = "btn btn-secondary btn-sm";
        if (this.bigbluebuttonbn.icons_enabled) {
            removeHtml = this.bigbluebuttonbn.pix_icon_delete;
            removeClass = "btn btn-link";
        }
        innerHTML = '<a class="' + removeClass + '" onclick="M.mod_bigbluebuttonbn.modform.participantRemove(\'';
        innerHTML += selectionTypeValue + '\', \'' + selectionValue;
        innerHTML += '\'); return 0;" title="' + this.strings.remove + '">' + removeHtml + '</a>';
        cell3.innerHTML = innerHTML;
    },

    participantListRoleUpdate: function(type, id) {
        // Update in memory.
        var participantListRoleSelection = document.getElementById('participant_list_role_' + type + '-' + id);
        for (var i = 0; i < this.bigbluebuttonbn.participant_list.length; i++) {
            if (this.bigbluebuttonbn.participant_list[i].selectiontype == type &&
                this.bigbluebuttonbn.participant_list[i].selectionid == (id === '' ? null : id)) {
                this.bigbluebuttonbn.participant_list[i].role = participantListRoleSelection.value;
            }
        }

        // Update in the form.
        this.participantListUpdate();
    },

    selectClear: function(id) {
        var select = document.getElementById(id);
        while (select.length > 0) {
            select.remove(select.length - 1);
        }
    },

    selectEnable: function(id) {
        var select = document.getElementById(id);
        select.disabled = false;
    },

    selectDisable: function(id) {
        var select = document.getElementById(id);
        select.disabled = true;
    },

    selectAddOption: function(id, text, value) {
        var select = document.getElementById(id);
        var option = document.createElement('option');
        option.text = text;
        option.value = value;
        select.add(option, option.length);
    }
};
