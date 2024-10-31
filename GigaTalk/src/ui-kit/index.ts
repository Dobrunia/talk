import { serverDATA } from "../types/types.ts";
import { serverName, serverCategory } from "../ui-kit/components.ts";

export function renderServerInfo(DATA: serverDATA[]) {
  let htmlContent = serverName(DATA[0].serverName);
  DATA[0].category?.forEach((element) => {
    htmlContent += serverCategory(element);
  });
  const server_slot = document.getElementById("server_components_block");
  if (!server_slot) {
    console.error("Server info container not found!");
    return;
  }
  server_slot.innerHTML = htmlContent;
}
