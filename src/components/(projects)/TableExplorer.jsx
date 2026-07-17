"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/ui/dropdown";
import ExportDropdown from "@/components/ui/ExportDropdown";
import MockDataGenerator from "@/components/(dashboard)/MockDataGenerator";
import Modal from "@/components/ui/modal";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { showToast } from "nextjs-toast-notify";
import { Trash, Loader2 } from "lucide-react";

export default function TableExplorer({ projectId }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [tablelist, settablelist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadtable, setloadtable] = useState(false);
  const [loadmore, setloadmore] = useState(false);
  const [limit, setlimit] = useState(20);
  const abortRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [editingCell, setEditingCell] = useState(null);
  const [editedvalue, seteditedvalue] = useState("");
  
  // Update confirmation modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [pendingUpdatePayload, setPendingUpdatePayload] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [deletebtn, setdeletebtn] = useState(false);
  const [deleteRows, setdeleteRows] = useState([]);

  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState(["XLSX", "CSV", "JSON"]);

  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [insertLoading, setInsertLoading] = useState(false);
  const [insertTableMeta, setInsertTableMeta] = useState(null);
  const [deletemodalopen, setdeletemodalopen] = useState(false);
  const [deleteloading, setdeleteloading] = useState(false);

  const handleinsertrow = async () => {
    try {
      if (!selectedTable) {
        showToast.warning('Please select a table before inserting a row', {
          duration: 2000,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
        });
        return;
      }
      setIsInsertModalOpen(true);
      const res = await fetch(`/api/projects/${projectId}/schema`, {
        credentials: 'include',
      });

      const payload = await res.json();

      if (!res.ok) {
        console.error('Failed to fetch schema for insert row:', payload.error || payload);
        showToast.error(payload.error || 'Failed to fetch schema for insert row', {
          duration: 2000,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
        });
        return;
      }

      const schema = payload?.schema || [];
      const tableMeta = schema.find((t) => t.name === selectedTable);
      if (!tableMeta) {
        showToast.error(`Table metadata for '${selectedTable}' not found`, {
          duration: 2000,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
        });
        return;
      }

      console.log('Metadata for insert row (from schema):', tableMeta);
      setInsertTableMeta(tableMeta);
      setIsInsertModalOpen(true);
      setInsertLoading(false);
    } catch (err) {
      console.error('Error in handleinsertrow:', err);
      showToast.error('Error fetching table metadata: ' + (err?.message || err), {
        duration: 2000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
      });
    }
  };

  const handleinsertSubmit = async (e) => {
    e.preventDefault();
    try {
      setInsertLoading(true);
      const form = e.target;
      const fd = new FormData(form);
      const body = {};
      for (const [key, value] of fd.entries()) {
        if (value !== '')
          body[key] = value;
      }
      const res = await fetch(`/api/projects/${projectId}/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: selectedTable, insertData: body }),
        credentials: "include",
      });

      const payload = await res.json();
      if (!res.ok) {
        try {
          const parseResponse = await fetch(`/api/ai/parse-error/${projectId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: payload?.error })
          });
          const parseData = await parseResponse.json();
          if (parseData.success && parseData.parsed) {
            showToast.error(parseData.parsed.userFriendlyExplanation, {
              duration: 5000,
              progress: true,
              position: "top-center",
              transition: "bounceIn",
            });
          } else {
            showToast.error(payload?.error || "Failed to prepare insert", {
              duration: 5000,
              progress: true,
              position: "top-center",
              transition: "bounceIn",
            });
          }
        } catch (parseError) {
          console.error("Error parsing insert error:", parseError);
          showToast.error(payload?.error || "Failed to prepare insert", {
            duration: 2000,
            progress: true,
            position: "top-center",
            transition: "bounceIn",
          });
        }
      } else {
        showToast.success('Row inserted successfully!', {
          duration: 2000,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
        });
      }
    } catch (err) {
      showToast.error('Error preparing insert payload: ' + (err?.message || err), {
        duration: 2000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
      });
    }
    setInsertLoading(false);
    setIsInsertModalOpen(false);
    setInsertTableMeta(null);
    fetchtabledata(selectedTable);
  };

  const handleExport = async (format) => {
    if (!selectedTable) {
      showToast.error("Please select a table to export", {
        duration: 2000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
      });
      return;
    }

    setIsExporting(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/export?format=${format.toLowerCase()}&table=${encodeURIComponent(selectedTable)}`
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to export data");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition");
      const a = document.createElement("a");
      a.href = url;

      if (disposition && disposition.includes("filename=")) {
        const filenameMatch = disposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          a.download = filenameMatch[1];
        } else {
          a.download = `${selectedTable.replace(/[^a-z0-9]/gi, "_")}.${format.toLowerCase()}`;
        }
      } else {
        a.download = `${selectedTable.replace(/[^a-z0-9]/gi, "_")}.${format.toLowerCase()}`;
      }

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Export error:", error);
      showToast.error(error.message || "Failed to export data", {
        duration: 2000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    setdeleteRows([]);
  }, [selectedTable]);

  const handleCellClick = (rowIndex, colName, value) => {
    setEditingCell({ rowIndex, colName, value });
    seteditedvalue(String(value ?? ""));
  };

  const handledelete = async () => {
    if (deleteRows.length === 0) {
      return;
    }
    setdeletemodalopen(true);
  };

  const deleteselectedrows = async () => {
    try {
      const pkcolarray = [];
      tableData.columns.forEach((col) => {
        if (col.constraint === "PRIMARY KEY") {
          pkcolarray.push(col.name);
        }
      });

      const pkValuesArray = deleteRows.map((rowObj) => {
        const pkVals = {};
        pkcolarray.forEach((colName) => {
          pkVals[colName] = rowObj[colName];
        });
        return pkVals;
      });

      const payload = {
        projectId: projectId,
        table: selectedTable || tableData.table,
        pkcols: pkcolarray,
        pkvalues: pkValuesArray,
      };

      const res = await fetch(`/api/projects/${projectId}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        try {
          const parseResponse = await fetch(`/api/ai/parse-error/${projectId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              error: result?.error || "Failed to delete rows"
            }),
          });
          
          const parseData = await parseResponse.json();
          if (parseData.success && parseData.parsed) {
            showToast.error(parseData.parsed.userFriendlyExplanation, {
              duration: 10000,
              progress: true,
              position: "top-center",
              transition: "bounceIn",
            });
          } else {
            showToast.error(result?.error || "Failed to delete rows", {
              duration: 2000,
              progress: true,
              position: "top-center",
              transition: "bounceIn",
            });
          }
        } catch (parseError) {
          console.error("Error parsing deletion error:", parseError);
          showToast.error(result?.error || "Failed to delete rows", {
            duration: 2000,
            progress: true,
            position: "top-center",
            transition: "bounceIn",
          });
        }
        
        setdeleteRows([]);
        setdeletemodalopen(false);
        setdeleteloading(false);
        return;
      }

      showToast.success(`Successfully deleted ${deleteRows.length} rows.`, {
        duration: 2000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: '',
        sound: true,
      });
      setdeleteRows([]);
      setdeletemodalopen(false);
      setdeleteloading(false);
      setTableData((prev) => {
        if (!prev) return prev;
        const filteredRows = prev.rows.filter((row) => {
          return !deleteRows.some((dr) => {
            return pkcolarray.every((colName) => {
              return row[colName] === dr[colName];
            });
          });
        });
        return { ...prev, rows: filteredRows };
      });
    } catch (err) {
      showToast.error("Error deleting rows: " + (err?.message || err), {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "bounceIn",
        icon: '',
        sound: true,
      });
    } 
  };

  const handleCellKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!editingCell || editedvalue === editingCell.value) {
        setEditingCell(null);
        return;
      }

      if (String(editedvalue).trim() === "") {
        showToast.error("Value cannot be empty", {
          duration: 2000,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
        });
        return;
      }

      try {
        const pkCol =
          tableData?.columns?.find((c) => c.constraint === "PRIMARY KEY")
            ?.name || tableData?.columns?.[0]?.name;
        const row = tableData.rows[editingCell.rowIndex];
        const payload = {
          table: selectedTable || tableData.table,
          pkColumn: pkCol,
          pkValue: row[pkCol],
          column: editingCell.colName,
          newValue: String(editedvalue).trim(),
          oldValue: editingCell.value,
          editingRowIndex: editingCell.rowIndex,
        };

        setPendingUpdatePayload(payload);
        setIsUpdateModalOpen(true);
      } catch (err) {
        console.error('Error preparing update payload:', err);
        showToast.error('Error preparing update.', {
          duration: 2000,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
        });
        setEditingCell(null);
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  async function performUpdate(payload) {
    setUpdateLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: payload.table,
          pkColumn: payload.pkColumn,
          pkValue: payload.pkValue,
          column: payload.column,
          newValue: payload.newValue,
          oldValue: payload.oldValue,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        showToast.error(result?.error || "Failed to update value", {
          duration: 2000,
          progress: true,
          position: "top-center",
          transition: "bounceIn",
        });
      } else {
        const updatedRow = result.row;
        setTableData((prev) => {
          if (!prev) return prev;
          const rows = prev.rows.map((r, idx) => {
            if (idx !== payload.editingRowIndex) return r;
            return updatedRow;
          });
          return { ...prev, rows };
        });
      }
    } catch (err) {
      window.alert("Error updating value", err);
    } finally {
      setEditingCell(null);
      setPendingUpdatePayload(null);
      setIsUpdateModalOpen(false);
      setUpdateLoading(false);
    }
  }

  const fetchTables = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tables`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to fetch tables:", data.error);
        return;
      }
    
      const names = data.tables.map((t) => t.name);
      settablelist(names);

      if (names.length > 0) {
        setSelectedTable(names[0]);
        fetchtabledata(names[0]);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchTables();
  }, [projectId]);

  const fetchtabledata = async (tablename, recordLimit = limit) => {
    // Cancel any in-flight request for a previous table
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = `table=${encodeURIComponent(tablename)}${
        recordLimit ? `&limit=${recordLimit}` : ""
      }`;
      const res = await fetch(`/api/projects/${projectId}/tables?${params}`, {
        credentials: "include",
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.rows == null || data.rows.length < recordLimit)
        setloadmore(false);
      if (!res.ok) throw new Error(data.error);
      setTableData(data);
      setloadtable(false);
    } catch (err) {
      if (err.name === 'AbortError') return; // Stale request — ignore
      console.error("Error fetching table data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={deletemodalopen}
        onClose={() => {  
          setdeletemodalopen(false);
          setdeleteRows([]);
        }}
        title={`Are you sure you want to delete the selected rows?`}
        subtitle={`This action can't be undone!`}
        loading={deleteloading}
        loadingTitle={deletemodalopen && deleteloading ? 'Deleting...' : undefined}
        loadingSubtitle={deletemodalopen && deleteloading ? 'Please wait while we delete the rows.' : undefined}
        loadingOverlay={true}
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          setdeleteloading(true);
          await deleteselectedrows();
        }}>
          <div className="flex gap-2 mt-4">
            <button type="button" className="px-4 py-2 border rounded cursor-pointer" onClick={() => {
              setdeleteRows([]);
              setdeletemodalopen(false);
            }}>Cancel</button>
            <button type="submit" className="px-4 py-2 border rounded text-red-800 cursor-pointer">Delete</button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isInsertModalOpen}
        onClose={() => {
          setIsInsertModalOpen(false);
          setInsertTableMeta(null);
          setInsertLoading(false);
        }}
        title={selectedTable ? `Insert into ${selectedTable}` : "Insert Row"}
        loading={insertLoading}
        loadingTitle={insertLoading ? 'Inserting...' : undefined}
        loadingSubtitle={insertLoading ? 'Please wait while we insert the row.' : undefined}
        loadingOverlay={true}
      >
        {insertTableMeta ? (
          <div className="space-y-3">
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleinsertSubmit(e);
            }}>
              {insertTableMeta.columns?.map((col) => {
                if (col.constraint === "PRIMARY KEY") return null;
                const isRequired = !col.nullable && col.default === null;
                return (
                  <div key={col.name} className="flex flex-col mb-2">
                    <label className="text-sm">
                      {col.name}
                      {isRequired && (
                        <span className="text-red-500 ml-1" aria-hidden>
                          *
                        </span>
                      )}
                    </label>
                    <input
                      name={col.name}
                      required={isRequired}
                      placeholder={
                        !col.nullable && col.default
                          ? `${col.default} will be set if no value provided`
                          : ""
                      }
                      className="border rounded p-2"
                    />
                  </div>
                );
              })}
              <div className="flex gap-2 mt-4">
                <button type="button" className="px-4 py-2 border rounded cursor-pointer" onClick={() => setIsInsertModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded cursor-pointer">Insert</button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">No metadata available. Try re-opening the dialog.</p>
            <div className="mt-3">
              <button onClick={handleinsertrow} className="px-3 py-1 border rounded cursor-pointer">Please wait or retry</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setPendingUpdatePayload(null);
          setEditingCell(null);
        }}
        title={pendingUpdatePayload ? `Update ${pendingUpdatePayload.column}` : 'Confirm Update'}
        subtitle={pendingUpdatePayload ? `Change value from "${pendingUpdatePayload.oldValue}" to "${pendingUpdatePayload.newValue}"?` : ''}
        loading={updateLoading}
        loadingTitle={updateLoading ? 'Updating...' : undefined}
        loadingSubtitle={updateLoading ? 'Please wait while we update the value.' : undefined}
        loadingOverlay={true}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">Are you sure you want to update this value?</p>
          <div className="flex gap-2 mt-4">
            <button type="button" className="px-4 py-2 border rounded cursor-pointer" onClick={() => {
              setIsUpdateModalOpen(false);
              setPendingUpdatePayload(null);
              setEditingCell(null);
            }}>Cancel</button>
            <button type="button" className="px-4 py-2 bg-primary text-white rounded cursor-pointer" onClick={async () => {
              if (!pendingUpdatePayload) return;
              await performUpdate(pendingUpdatePayload);
            }}>
              {updateLoading ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>

      <div className="table_select gradient-toolbar h-16 flex items-center px-5 gap-3 animate-slide-in-down">
        <span className="section-header">Table Explorer</span>
        <Dropdown
          items={tablelist}
          selected={selectedTable}
          onSelect={(t) => {
            if (t === selectedTable) return;
            setSelectedTable(t);
            fetchtabledata(t);
            setIsExpanded(false);
            setloadtable(true);
          }}
        />
      </div>

      <div className="mockbutton gap-3 gradient-toolbar items-center flex-col max-[830]:h-auto min-[830]:flex-row min-[830]:h-16 flex px-5 py-3 justify-between animate-slide-in-down border-b border-border/10">
        <div className="frontbtn flex flex-row gap-2 max-[830]:flex-col max-[830]:w-full max-[830]:gap-2">
          <Button className="max-[510]:w-full btn-glow shadow-sm" disabled={insertLoading} onClick={async () => {
            await handleinsertrow();
          }}>
            {insertLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-1" />
                Inserting...
              </>
            ) : (
              <span className="flex items-center gap-1.5">＋ Insert Row</span>
            )}
          </Button>

          <Button
            className={`text-foreground border shadow-sm transition-all duration-200 ${
              deletebtn
                ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                : 'bg-white/80 border-border/30 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
            } hover:cursor-pointer`}
            onClick={tableData ? async () => {
              if (deletebtn) await handledelete();
              setdeletebtn(!deletebtn);
            } : null}
          >
            <Trash className="h-4 w-4" />
            {!deletebtn ? "Delete" : tableData && tableData.rows.length > 0 ? `Selected: ${deleteRows.length}` : "Delete"}
          </Button>
        </div>

        <div className="endbtn flex gap-3 max-[830]:gap-2 max-[830]:flex-col max-[830]:w-full">
          <MockDataGenerator
            projectId={projectId}
            onSuccess={() => selectedTable && fetchtabledata(selectedTable)}
          />

          <ExportDropdown
            options={exportOptions}
            onSelect={handleExport}
            disabled={
              !selectedTable ||
              !tableData ||
              tableData.rows.length === 0
            }
            isLoading={isExporting}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {loadtable ? (
          <div className="p-6 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="skeleton h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-border/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton h-4 rounded" style={{ width: "35%" }} />
                <div className="skeleton h-4 rounded" style={{ width: "16%" }} />
                <div className="skeleton h-4 rounded" style={{ width: "16%" }} />
                <div className="skeleton h-4 rounded" style={{ width: "16%" }} />
                <div className="skeleton h-4 rounded" style={{ width: "12%" }} />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="skeleton h-4 rounded flex-1" />
                    <div className="skeleton h-4 rounded" style={{ width: '16%' }} />
                    <div className="skeleton h-4 rounded" style={{ width: '16%' }} />
                    <div className="skeleton h-4 rounded" style={{ width: '16%' }} />
                    <div className="skeleton h-4 rounded" style={{ width: '12%' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : tableData ? (
          <>
            <div className="w-full overflow-x-auto max-w-full overflow-y-auto h-fit p-4 animate-slide-in-up">
              <table className="min-w-max w-full premium-table rounded-xl overflow-hidden shadow-sm">
                <thead className="tb_head">
                  <tr>
                    {deletebtn && tableData && tableData.rows.length > 0 ? (
                      <th className="px-4 py-3 text-center whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-primary"> </th>
                    ) : null}
                    {tableData.columns.map((col) => (
                      <th key={col.name} className="px-4 py-3 text-left whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-primary">
                        <span className="flex items-center gap-1">
                          {col.name}
                          {col.constraint === 'PRIMARY KEY' && (
                            <span className="text-amber-500 text-xs" title="Primary Key">🔑</span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="stagger-children">
                  {tableData.rows.length > 0 ? (
                    tableData.rows.map((row, i) => (
                      <tr key={i} className="animate-slide-in-up border-b border-border/10 hover:bg-primary/5 transition-colors duration-150">
                        {deletebtn ? (
                          <td className="px-4 py-2 text-center whitespace-nowrap hover:bg-sidebar hover:border-1 cursor-pointer">
                            {tableData.rows.length > 0 ? (
                              <input
                                type="checkbox"
                                checked={deleteRows.some((dr) =>
                                  tableData.columns
                                    .filter((c) => c.constraint === "PRIMARY KEY")
                                    .every((pkCol) => row[pkCol.name] === dr[pkCol.name])
                                )}
                                onChange={(e) => {
                                  const pkCols = tableData.columns.filter(
                                    (c) => c.constraint === "PRIMARY KEY"
                                  );
                                  const columnsToUse = pkCols;
                                  const pkValues = {};
                                  columnsToUse.forEach((col) => {
                                    pkValues[col.name] = row[col.name];
                                  });

                                  if (e.target.checked) {
                                    setdeleteRows((prev) => [...prev, pkValues]);
                                  } else {
                                    setdeleteRows((prev) =>
                                      prev.filter(
                                        (val) =>
                                          !columnsToUse.every((col) => val[col.name] === row[col.name])
                                      )
                                    );
                                  }
                                }}
                              />
                            ) : null}
                          </td>
                        ) : null}

                        {tableData.columns.map((col) => (
                          <td
                            key={col.name}
                            className={`px-4 py-2 text-center whitespace-nowrap hover:bg-sidebar hover:border-1 cursor-pointer ${
                              editingCell?.rowIndex === i && editingCell?.colName === col.name
                                ? "hover:bg-sidebar ring-2 ring-blue-500 ring-opacity-50"
                                : ""
                            }`}
                            onClick={() => {
                              handleCellClick(i, col.name, row[col.name]);
                            }}
                          >
                            {editingCell?.rowIndex === i && editingCell?.colName === col.name ? (
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-center focus:outline-none"
                                value={editedvalue}
                                onChange={(e) => seteditedvalue(e.target.value)}
                                onKeyDown={handleCellKeyDown}
                                autoFocus
                              />
                            ) : (
                              String(row[col.name] ?? "")
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableData.columns.length} className="text-center py-4 text-gray-500">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {tableData && tableData.rows.length > 0 ? (
              <div className="flex justify-center mt-3 w-full">
                <Button
                  onClick={async () => {
                    setloadmore(true);
                    if (isExpanded) {
                      await fetchtabledata(selectedTable, limit);
                      setIsExpanded(false);
                    } else {
                      await fetchtabledata(selectedTable, null);
                      setIsExpanded(true);
                    }
                    setloadmore(false);
                  }}
                  className="text-black bg-sidebar border-1 hover:bg-gray-300 hover:cursor-pointer"
                  disabled={loadmore}
                >
                  {loadmore ? (
                    <>
                      <DotLottieReact
                        src="https://lottie.host/bc9b7976-f4d5-43d6-bf35-d97023948cbd/0LrKX98liy.lottie"
                        loop
                        autoplay
                        style={{ width: 28, height: 28 }}
                      />
                      Loading...
                    </>
                  ) : isExpanded ? (
                    "Load Less"
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-4">
              <svg
                className="animate-spin h-8 w-8"
                style={{ color: "var(--primary)" }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <div>
                <div className="h-4 w-56 bg-gray-200 rounded-md mb-2 animate-pulse" />
                <div className="text-sm text-gray-500">
                  Loading table data...
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-4 bg-gray-200 rounded" style={{ width: "35%" }} />
                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: "16%" }} />
                <div className="h-4 bg-gray-200 rounded" style={{ width: "16%" }} />
                <div className="h-4 bg-gray-200 rounded" style={{ width: "16%" }} />
                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: "12%" }} />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="h-4 bg-gray-200 rounded flex-1" />
                    <div className="h-4 bg-gray-200 rounded" style={{ width: "16%" }} />
                    <div className="h-4 bg-gray-200 rounded" style={{ width: "16%" }} />
                    <div className="h-4 bg-gray-200 rounded" style={{ width: "16%" }} />
                    <div className="h-4 bg-gray-200 rounded" style={{ width: "12%" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
