import { Request, Response } from "express";
import {
  createWorkspaceService,
  getMyWorkspacesService,
} from "./workspace.service";

export const createWorkspace = async (
  req: Request,
  res: Response
) => {
    try{
        const { name } = req.body;

        const workspace = await createWorkspaceService(
            req.user!.id,
            name
        );

        return res.status(201).json({
            success: true,
            workspace,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
  
};

export const getMyWorkspaces = async (
  req: Request,
  res: Response
) => {
    try {
        const workspaces = await getMyWorkspacesService(
            req.user!.id
        );
        return res.status(200).json({
            success: true,
            workspaces,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        }); 
    }
};