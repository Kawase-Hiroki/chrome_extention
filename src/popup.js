document.getElementById("show").addEventListener("click", () => {
  chrome.storage.local.get(null, (result) => {
    document.getElementById("output").textContent = JSON.stringify(result, null, 2);
  });
});
  
document.getElementById("clear").addEventListener("click", () => {
  chrome.storage.local.clear(() => {
    alert("保存されたデータをすべて削除しました！");
    document.getElementById("output").textContent = "";
  });
});
  